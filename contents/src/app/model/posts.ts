import { SafeStyle } from "@angular/platform-browser/src/security/dom_sanitization_service";
import { marker } from "./marker";

export class posts {
    postsID?: number;
    postDate?: string;
    postClassify: number;   //10:게시글, 20:앨범, 30:지도, 40:일정
    studentNum?: number;
    publisherId?: number;   //옵셔널 아님
    publisher: string;
    publisherIntro?: string;
    publisherImg?: SafeStyle;
    images?: string[];
    title: string;
    body: string;
    good?: number; 
    bad?: number; 
    marker?: marker;
    tag?: Array<string>;
    commentCount?: number;
}