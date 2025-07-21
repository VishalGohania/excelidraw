"use client"

import { useParams } from "next/navigation";
import styles from "../../page.module.css";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.slug;

  return (
    <div className={styles.page}>
      <h1>Room: {roomId}</h1>
      <p>This is a placeholder for the room content.</p>
    </div>
  );
}