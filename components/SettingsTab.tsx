import React, { useState, useEffect } from 'react';

const SocialLink: React.FC<{ platform: string, url:string, handle: string, icon: React.ReactNode }> = ({ platform, url, handle, icon }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-2 p-2 bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-colors duration-200"
  >
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
      {icon}
    </div>
    <div className='overflow-hidden'>
      <p className="font-bold text-white text-sm">{platform}</p>
    </div>
  </a>
);

interface YoutubeVideo {
  id: string;
  title: string;
}

const SettingsTab: React.FC = () => {
  const YoutubeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 48 48">
        <path fill="#FF3D00" d="M43.2,33.9c-0.4,2.1-2.1,3.7-4.2,4c-3.3,0.3-8.8,0.5-15,0.5s-11.7-0.2-15-0.5c-2.1-0.3-3.8-1.9-4.2-4C4.4,31.6,4,28.2,4,24s0.4-7.6,0.8-9.9c0.4-2.1,2.1-3.7,4.2-4C12.3,9.8,17.8,9.6,24,9.6s11.7,0.2,15,0.5c2.1,0.3,3.8,1.9,4.2,4c0.4,2.3,0.8,5.7,0.8,9.9S43.6,31.6,43.2,33.9z"></path><path fill="#FFF" d="M20 31L20 17 32 24z"></path>
    </svg>
  );

  const FacebookIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 48 48">
        <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5z"></path><path fill="#fff" d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.261,2.735-7.261,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"></path>
    </svg>
  );

  const TiktokIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="black"/>
        <path fill="white" d="M12.525 3.692v10.372c0 .524-.13 1.048-.383 1.513a3.39 3.39 0 0 1-2.023 1.905c-1.87.7-3.992-.17-4.69-1.87a3.34 3.34 0 0 1 1.74-4.522c.23-.105.475-.152.72-.152v-2.93c-.225-.015-.45-.03-.675-.03-2.925 0-5.295 2.37-5.295 5.295s2.37 5.295 5.295 5.295S14.625 17.07 14.625 14.1V8.657a4.99 4.99 0 0 0 2.228-4.215V3.692h-4.328Z"/>
    </svg>
  );

  const ZaloIcon = (
    <svg width="32" height="32" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="white" stroke="#0190F3" strokeWidth="5"/>
      <path d="M100 35 C61.5 35 30 66.5 30 105 C30 134.7 48.4 159.2 75 168 L75 145 C60.7 138.3 50 123.1 50 105 C50 77.4 72.4 55 100 55 C127.6 55 150 77.4 150 105 C150 123.1 139.3 138.3 125 145 L125 168 C151.6 159.2 170 134.7 170 105 C170 66.5 138.5 35 100 35Z" fill="#0190F3"/>
      <text x="100" y="115" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="bold" fill="white" textAnchor="middle">Zalo</text>
    </svg>
  );

  const [latestVideos, setLatestVideos] = useState<YoutubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestVideos = async () => {
      try {
        const channelId = 'UCwSbzgfgu1iMfOR__AB4QGQ';
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
          )}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch video feed');
        }
        const data = await response.json();
        
        if (data.status === 'ok' && data.items) {
          const videos = data.items.slice(0, 2).map((item: any) => ({
            id: item.guid.split(':')[2],
            title: item.title,
          }));
          setLatestVideos(videos);
        } else {
            throw new Error('Invalid data from video feed API');
        }
      } catch (error) {
        console.error("Could not load YouTube videos:", error);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchLatestVideos();
  }, []);

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="grid grid-cols-2 gap-3">
          <SocialLink platform="Youtube" handle="@lukhach-digital" url="https://youtube.com/@lukhach-digital" icon={YoutubeIcon} />
          <SocialLink platform="Facebook" handle="lukhach.com.vn" url="https://facebook.com/lukhach.com.vn" icon={FacebookIcon} />
          <SocialLink platform="Tiktok" handle="@lukhach.com.vn" url="https://tiktok.com/@lukhach.com.vn" icon={TiktokIcon} />
          <SocialLink platform="Zalo" handle="0979.007.367" url="https://zalo.me/0979007367" icon={ZaloIcon} />
        </div>
        <div className="mt-6 flex justify-center">
            <img 
                src="https://lamyoutubeai.com/Image/logotool.png" 
                alt="Làm Youtube AI Logo" 
                className="w-28 h-28 object-cover rounded-full border-2 border-blue-500 shadow-lg shadow-blue-500/30 p-1 bg-slate-800" 
            />
        </div>

        <div className="mt-8">
          <h4 className="text-md font-bold text-white mb-3 text-center">Video chia sẻ mới nhất</h4>
          <div className="space-y-4">
            {videosLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="aspect-video w-full bg-slate-700/50 rounded-lg flex items-center justify-center">
                   <p className="text-sm text-gray-400">Loading Video...</p>
                </div>
              ))
            ) : latestVideos.length > 0 ? (
              latestVideos.map(video => (
                 <div key={video.id} className="aspect-video w-full overflow-hidden rounded-lg border-2 border-slate-600 shadow-lg bg-black flex items-center justify-center">
                    {playingVideoId === video.id ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="relative w-full h-full cursor-pointer group" onClick={() => setPlayingVideoId(video.id)}>
                        <img 
                            src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.endsWith('hqdefault.jpg')) {
                                    target.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                                }
                            }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        </div>
                      </div>
                    )}
                 </div>
              ))
            ) : (
               <div className="aspect-video w-full bg-slate-700/50 rounded-lg flex items-center justify-center">
                 <p className="text-sm text-red-400">Could not load videos.</p>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsTab;
