import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import { getVideos } from "./firebase/functions";

export default async function Home() {
  const videos = await getVideos();
  
  return (
    <div>
      {
        videos.map((video) => (
          <Link href={`/watch?v=${video.filename}`} key={video.id}>
          <Image src={'/thumbnail.png'} alt='video' width={120} height={80}
            className={styles.thumbnail}/>
          </Link>
        ))
      } 
    </div>
  );
}

export const revalidate = 30;