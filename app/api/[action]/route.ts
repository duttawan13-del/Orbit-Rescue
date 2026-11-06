import {env} from "cloudflare:workers";
import {missionApi} from "../../../lib/mission.mjs";
export const dynamic="force-dynamic";
export function GET(request:Request){return missionApi(request,env.DB);}
export function POST(request:Request){return missionApi(request,env.DB);}