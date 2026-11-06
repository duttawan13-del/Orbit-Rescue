"use client";
import {useEffect} from "react";
export default function Home(){
 useEffect(()=>{const script=document.createElement("script"); script.type="module";script.src="/game.js";document.body.appendChild(script);return ()=>script.remove();},[]);
 return <div id="orbit"><p>กำลังเชื่อมต่อศูนย์ควบคุม…</p></div>;
}