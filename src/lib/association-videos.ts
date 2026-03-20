export interface AssociationItem {
  type: 'image' | 'video';
  src: string;
  thumb?: string;
  alt: string;
}

export const NODE_VIDEOS: Record<string, AssociationItem[]> = {
  werk: [
    { type: 'video', src: 'https://videos.pexels.com/video-files/854678/854678-sd_640_360_30fps.mp4', alt: 'old books flipping pages' },
    { type: 'video', src: 'https://videos.pexels.com/video-files/854029/854029-sd_640_360_30fps.mp4', alt: 'studio workspace' },
    { type: 'video', src: 'https://videos.pexels.com/video-files/854225/854225-sd_640_360_30fps.mp4', alt: 'craft workshop' },
    { type: 'video', src: 'https://videos.pexels.com/video-files/854339/854339-sd_640_360_30fps.mp4', alt: 'artisan at work' },
  ],
  schaffen: [
    { type: 'video', src: 'https://videos.pexels.com/video-files/857032/857032-sd_640_360_30fps.mp4', alt: 'glassblowing' },
    { type: 'video', src: 'https://videos.pexels.com/video-files/857031/857031-sd_640_360_30fps.mp4', alt: 'metalworking' },
    { type: 'video', src: 'https://videos.pexels.com/video-files/854677/854677-sd_640_360_30fps.mp4', alt: 'hands shaping material' },
    { type: 'video', src: 'https://videos.pexels.com/video-files/854679/854679-sd_640_360_30fps.mp4', alt: 'craftsman tools' },
    { type: 'video', src: 'https://videos.pexels.com/video-files/857033/857033-sd_640_360_30fps.mp4', alt: 'making process' },
  ],
};
