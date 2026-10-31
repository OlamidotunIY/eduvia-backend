TF_DIR = infrastructure/terraform
VM_IP = $(shell terraform -chdir=$(TF_DIR) output -raw k3s_vm_public_ip)
SSH_OPTIONS = -o BatchMode=yes -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=2 -o StrictHostKeyChecking=no
MYSQL_TUNNEL_PORT ?= 3307
MYSQL_SERVICE ?= mysql
MYSQL_SERVICE_PORT ?= 3306
MYSQL_NAMESPACE ?= default
DEPLOY_ENV_FILE ?= .env.production
FIREBASE_JSON := $(firstword $(wildcard infrastructure/Firebase/*.json))
FIREBASE_JSON_NAME := $(notdir $(FIREBASE_JSON))
MYSQL_SERVICE_IP = $(shell $(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "sudo k3s kubectl -n $(MYSQL_NAMESPACE) get svc $(MYSQL_SERVICE) -o jsonpath='{.spec.clusterIP}'")

ifeq ($(OS),Windows_NT)
    SSH = C:\Windows\sysnative\OpenSSH\ssh.exe
    SCP = C:\Windows\sysnative\OpenSSH\scp.exe
    CAT = type
    SSH_KEY = $(USERPROFILE)\.ssh\id_rsa_azure
else
    SSH = ssh
    SCP = scp
    CAT = cat
    SSH_KEY = ~/.ssh/id_rsa_azure
endif

.PHONY: start stop backup-db restore-db ssh mysql-tunnel logs prune-runtime-images build-image deploy-stack configure-tls

TLS_CERT ?= infrastructure/tls/api.eduvia.name.ng.pem
TLS_KEY ?= infrastructure/tls/api.eduvia.name.ng.key

# 1. Build the infrastructure from scratch and deploy stack
start:
	@echo "=> Building Azure infrastructure..."
	cd $(TF_DIR) && terraform init -upgrade && terraform apply -auto-approve
	@echo "=> Waiting 45s for VM SSH to boot..."
	timeout /t 45 /nobreak
	$(MAKE) deploy-stack

# Internal target: runs AFTER infrastructure exists so $(VM_IP) evaluates correctly
deploy-stack:
	$(if $(wildcard $(DEPLOY_ENV_FILE)),,$(error Missing deployment environment file: $(DEPLOY_ENV_FILE)))
	@echo "=> Checking if Docker and K3s are installed and ready..."
	$(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "while ! command -v docker >/dev/null 2>&1; do echo 'Waiting for Docker...'; sleep 5; done; while ! command -v k3s >/dev/null 2>&1; do echo 'Waiting for K3s...'; sleep 5; done; while ! sudo k3s kubectl get node >/dev/null 2>&1; do echo 'Waiting for Kubernetes to be ready...'; sleep 5; done; echo 'Infrastructure is Ready!'"
	@echo "=> Syncing Secrets to VM..."
	@echo "=> Syncing $(DEPLOY_ENV_FILE) from the local deployment source..."
	@$(SCP) -O $(SSH_OPTIONS) -i $(SSH_KEY) $(DEPLOY_ENV_FILE) ubuntu@$(VM_IP):/tmp/.env.production
ifneq ($(strip $(FIREBASE_JSON)),)
	@$(SCP) -O $(SSH_OPTIONS) -i $(SSH_KEY) $(FIREBASE_JSON) ubuntu@$(VM_IP):/tmp/$(FIREBASE_JSON_NAME)
else
	@echo "=> No Firebase service-account JSON found; using the placeholder Kubernetes secret."
endif
	@echo "=> Building the current Docker Image and loading it into K3s..."
	$(MAKE) build-image
	@echo "=> Applying Kubernetes Secrets..."
	$(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "export KUBECONFIG=/home/ubuntu/.kube/config && trap 'rm -f /tmp/.env.production' EXIT && kubectl create secret generic eduvia-secrets --from-env-file=/tmp/.env.production --dry-run=client -o yaml | kubectl apply -f - && kubectl delete secret firebase-secrets --ignore-not-found && if [ -f '/tmp/$(FIREBASE_JSON_NAME)' ]; then kubectl create secret generic firebase-secrets --from-file=/tmp/$(FIREBASE_JSON_NAME); else kubectl create secret generic firebase-secrets --from-literal=placeholder=true; fi"
	@echo "=> Applying Kubernetes Manifests..."
	$(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "if [ ! -d 'eduvia' ]; then git clone https://github.com/OlamidotunIY/eduvia-backend.git eduvia; fi && cd eduvia && git checkout dev && git pull origin dev"
	$(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "export KUBECONFIG=/home/ubuntu/.kube/config && kubectl apply -k eduvia/infrastructure/k8s/base"
	@echo "=> Waiting for MySQL to boot and accept connections..."
	@$(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "export KUBECONFIG=/home/ubuntu/.kube/config && while true; do POD=$$(kubectl get pod -l app=mysql -o jsonpath='{.items[0].metadata.name}' 2>/dev/null); if [ -n \"$$POD\" ]; then if kubectl exec $$POD -- mysqladmin ping -u root -proot --silent 2>/dev/null; then break; fi; fi; echo 'Waiting for MySQL container...'; sleep 5; done; echo 'MySQL is fully ready!'"
	@echo "=> Restoring Database..."
	$(MAKE) restore-db
	@echo "=> Rolling out the Eduvia application..."
	$(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "export KUBECONFIG=/home/ubuntu/.kube/config && kubectl rollout restart deployment/eduvia-app && kubectl rollout status deployment/eduvia-app --timeout=180s"
	$(MAKE) prune-runtime-images
	@echo "=> Environment is completely up and running!"

build-image:
	@echo "=> Building Docker Image and Loading into K3s..."
	$(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "if [ ! -d 'eduvia' ]; then git clone https://github.com/OlamidotunIY/eduvia-backend.git eduvia; fi && cd eduvia && git checkout dev && git pull origin dev && sudo docker build -t eduvia/app:latest . && sudo docker save eduvia/app:latest | sudo k3s ctr images import -"

prune-runtime-images:
	@echo "=> Pruning unused Docker build cache and K3s images..."
	$(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "sudo docker builder prune -af && sudo docker image prune -af && sudo k3s crictl rmi --prune"

# 2. Backup the database and completely destroy the infrastructure
stop:
	@echo "=> Backing up the database to local machine..."
	-$(MAKE) backup-db
	@echo "=> Destroying all Azure infrastructure (including disks)..."
	cd $(TF_DIR) && terraform destroy -auto-approve
	@echo "=> Environment destroyed. Billing is now $$0."

# 3. SSH directly into the VM
ssh:
	@echo "=> Connecting to VM..."
	$(SSH) -i $(SSH_KEY) -o StrictHostKeyChecking=no ubuntu@$(VM_IP)

# Open a local MySQL tunnel directly to the Kubernetes service ClusterIP
mysql-tunnel:
	$(if $(strip $(MYSQL_SERVICE_IP)),,$(error Unable to resolve the Kubernetes MySQL service IP))
	@echo "=> Forwarding local port $(MYSQL_TUNNEL_PORT) to $(MYSQL_SERVICE):$(MYSQL_SERVICE_PORT) in namespace $(MYSQL_NAMESPACE)..."
	@echo "=> Keep this terminal open; press Ctrl+C to close the tunnel."
	$(SSH) $(SSH_OPTIONS) -o ExitOnForwardFailure=yes -N -i $(SSH_KEY) -L $(MYSQL_TUNNEL_PORT):$(MYSQL_SERVICE_IP):$(MYSQL_SERVICE_PORT) ubuntu@$(VM_IP)

# Follow application logs from every Eduvia pod. Press Ctrl+C to stop following.
logs:
	$(SSH) $(SSH_OPTIONS) -t -i $(SSH_KEY) ubuntu@$(VM_IP) "export KUBECONFIG=/home/ubuntu/.kube/config && kubectl logs -l app=eduvia-app --all-containers=true --prefix=true --tail=200 --follow --max-log-requests=10"

# Upload the ignored origin certificate and create/update the
# Kubernetes TLS secret used by the Traefik ingress.
configure-tls:
	$(SCP) -O $(SSH_OPTIONS) -i $(SSH_KEY) $(TLS_CERT) ubuntu@$(VM_IP):/tmp/api.eduvia.name.ng.pem
	$(SCP) -O $(SSH_OPTIONS) -i $(SSH_KEY) $(TLS_KEY) ubuntu@$(VM_IP):/tmp/api.eduvia.name.ng.key
	$(SSH) $(SSH_OPTIONS) -i $(SSH_KEY) ubuntu@$(VM_IP) "export KUBECONFIG=/home/ubuntu/.kube/config && kubectl create secret tls eduvia-api-tls --cert=/tmp/api.eduvia.name.ng.pem --key=/tmp/api.eduvia.name.ng.key --dry-run=client -o yaml | kubectl apply -f - && rm -f /tmp/api.eduvia.name.ng.pem /tmp/api.eduvia.name.ng.key"

# -----------------------------------------------------------------------------
# DATABASE BACKUP & RESTORE COMMANDS
# -----------------------------------------------------------------------------

backup-db:
	@echo "=> Running MySQL Backup via SSH (Kubernetes)..."
	@echo "=> Connecting to the VM, running mysqldump inside the kubernetes pod, and saving it locally."
	$(SSH) -i $(SSH_KEY) -o StrictHostKeyChecking=no ubuntu@$(VM_IP) "export KUBECONFIG=/home/ubuntu/.kube/config && POD=$$(kubectl get pod -l app=mysql -o jsonpath='{.items[0].metadata.name}') && kubectl exec $$POD -- mysqldump -u root -proot eduvia" > eduvia_backup.sql

restore-db:
	@echo "=> Restoring MySQL Backup via SSH (Kubernetes)..."
	@if not exist eduvia_backup.sql echo "=> No backup file found. Skipping restore."
	@if exist eduvia_backup.sql echo "=> Sending the local SQL file to the VM and piping it into the MySQL kubernetes pod."
	@if exist eduvia_backup.sql $(CAT) eduvia_backup.sql | $(SSH) -i $(SSH_KEY) -o StrictHostKeyChecking=no ubuntu@$(VM_IP) "export KUBECONFIG=/home/ubuntu/.kube/config && POD=$$(kubectl get pod -l app=mysql -o jsonpath='{.items[0].metadata.name}') && kubectl exec -i $$POD -- mysql -u root -proot eduvia"
