output "k3s_vm_public_ip" {
  description = "Public IP address of the K3s node"
  value       = azurerm_public_ip.public_ip.ip_address
}

output "k3s_vm_id" {
  description = "The ID of the K3s VM"
  value       = azurerm_linux_virtual_machine.k3s_node.id
}
