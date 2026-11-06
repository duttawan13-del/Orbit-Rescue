import type { Metadata } from "next";
export const metadata: Metadata={title:"Orbit Rescue | ภารกิจกู้ยานอวกาศ",description:"เกมผจญภัยทบทวนระบบสุริยะ ซ่อมยานสามระบบแล้วพาทีมกลับโลก",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><head><link rel="stylesheet" href="/orbit.css"/></head><body>{children}</body></html>;}