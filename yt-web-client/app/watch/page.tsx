'use client';

import { useSearchParams } from "next/navigation";

export default function Watch() {
    const videoPrefix = 'https://storage.googleapis.com/ir11-yt-processed-videos/'
    const videoSrc = useSearchParams().get('v');

    return(
        <div>
            <p>Watch Page</p>
            <video controls src={videoPrefix + videoSrc}/>
        </div>
    );
}