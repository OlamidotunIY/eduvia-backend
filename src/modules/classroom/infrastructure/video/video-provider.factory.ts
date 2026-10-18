import { Injectable } from '@nestjs/common';
import { IVideoProviderPort } from '../../domain/ports/video-provider.port';
import { ZoomAdapter } from './zoom.adapter';
import { GoogleMeetAdapter } from './google-meet.adapter';

@Injectable()
export class VideoProviderFactory {
  constructor(
    private readonly zoom: ZoomAdapter,
    private readonly googleMeet: GoogleMeetAdapter,
  ) {}

  get(provider: 'zoom' | 'google_meet'): IVideoProviderPort {
    return provider === 'zoom' ? this.zoom : this.googleMeet;
  }

  getDefault(): IVideoProviderPort {
    const provider = (process.env.VIDEO_DEFAULT_PROVIDER ?? 'zoom') as
      | 'zoom'
      | 'google_meet';
    return this.get(provider);
  }
}
