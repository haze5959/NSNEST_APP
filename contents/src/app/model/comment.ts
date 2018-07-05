import { SafeStyle } from "@angular/platform-browser/src/security/dom_sanitization_service";
import { marker } from "./marker";

export class comment {
    commentId?: number;
    postId: number;
    commentDate?: string;
    studentNum?: number;
    userId: number;   //옵셔널 아님
    userName?: string;
    userImg?: SafeStyle;
    emoticon?: string;
    comment: string;
    good?: number;
}