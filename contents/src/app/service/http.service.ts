import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from "rxjs/Rx";
import { CognitoUtil } from './awsService/cognito.service';

import { environment } from '../../environments/environment';
import { comment } from '../model/comment';
import { posts } from '../model/posts';
import { user } from '../model/user';

const timeout = 30000; //30초
// const timeoutText = {text: "타임아웃 되었습니다."};

@Injectable()
export class HttpService {

  constructor(private http: HttpClient, private cognitoUtil: CognitoUtil){}

  //============================================================
  //GET
  //============================================================
  /**
   * 유저정보 가져오기
   * sort = rank:잉여랭크 / update:활동일
   */
  getUsers(sort: string, count: number): Observable<Array<any>> {
    const requestUrl = `${environment.apiUrl}users?sort=${sort}&count=${count}`;

    return this.http.get<Array<any>>(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  getUser(userId: number): Observable<Array<any>> {
    const requestUrl = `${environment.apiUrl}users?userId=${userId}`;

    return this.http.get<Array<any>>(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  /**
   * 게시글 가져오기
   * classify = 0:전체 / 10:게시글 / 20:앨범 / 30:지도 / 40:스케쥴
   * sort = id / good / bad
   */
  getPosts(classify: number, sort: string, order: string, page: number, contents?: string): Observable<Array<any>> {
    var accessToken = "";
    this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
    });

    if(!accessToken || accessToken == "" || this.isTokenExpired(accessToken)){
      // alert("토큰 리프레시");
      this.cognitoUtil.refresh();
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
      });
    }
  
    let requestUrl = `${environment.apiUrl}posts?classify=${classify}&sort=${sort}&order=${order}&page=${page}&accessToken=${accessToken}`;
    if(contents){
      requestUrl = `${environment.apiUrl}posts?classify=${classify}&sort=${sort}&order=${order}&page=${page}&contents=${contents}&accessToken=${accessToken}`;
    }
    
    return this.http.get<Array<any>>(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  /**
   * 갯수 상관 없이 게시글 가져오기
   * classify = 0:전체 / 10:게시글 / 20:앨범 / 30:지도 / 40:스케쥴
   * sort = id / good / bad
   */
  getPostAll(classify: number, sort: string, order: string, contents?: string): Observable<Array<any>> {
    var accessToken = "";
    this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
    });

    if(!accessToken || accessToken == "" || this.isTokenExpired(accessToken)){
      // alert("토큰 리프레시");
      this.cognitoUtil.refresh();
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
      });
    }

    let requestUrl = `${environment.apiUrl}posts/all?classify=${classify}&sort=${sort}&order=${order}&accessToken=${accessToken}`;
    if(contents){
      requestUrl = `${environment.apiUrl}posts/all?classify=${classify}&sort=${sort}&order=${order}&contents=${contents}&accessToken=${accessToken}`;
    }
    
    return this.http.get<Array<any>>(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  getPost(postId: number): Observable<Array<any>> {
    var accessToken = "";
    this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
    });

    if(!accessToken || accessToken == "" || this.isTokenExpired(accessToken)){
      // alert("토큰 리프레시");
      this.cognitoUtil.refresh();
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
      });
    }

    const requestUrl = `${environment.apiUrl}posts?postId=${postId}&accessToken=${accessToken}`;
    return this.http.get<Array<any>>(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  getPostSize(classify: number, contents?: string): Observable<Array<any>> {
    var requestUrl = `${environment.apiUrl}posts/pageSize?classify=${classify}`;
    if(contents){
      requestUrl = requestUrl + `&contents=${contents}`;
    }

    return this.http.get<Array<any>>(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  /**
   * 코멘트 가져오기
   */
  getComments(postId: number): Observable<Array<any>> {
    const requestUrl = `${environment.apiUrl}comment?postId=${postId}`;

    return this.http.get<Array<any>>(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  /**
   * 이모티콘 리스트 가져오기
   */
  getEmoticon(type:string, emoKey?:string): Observable<Array<any>> {
    var requestUrl = `${environment.apiUrl}posts/emoticon?type=${type}`;
    if(emoKey){
      requestUrl = requestUrl + `&emoKey=${emoKey}`;
    }

    return this.http.get<Array<any>>(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  /**
   * 코그니토를 통한 유저정보 가져오기
   * 서버에서 해당 유저의 정보가 없는 경우, 첫 로그인이라고 판별하고 유저를 디비에 등록시킨다.
   */
  getUserWithConito(cognitoSub: string, name?: string, studentNum?: number, birthDay?: string, gender?: string): Observable<Array<any>> {
    var requestUrl = `${environment.apiUrl}users/cognito?cognitoSub=${cognitoSub}`;
    if(name && studentNum && birthDay && gender){
      requestUrl = requestUrl + `&name=${name}` + `&studentNum=${studentNum}` + `&birthDay=${birthDay}` + `&gender=${gender}`;
    }

    return this.http.get<Array<any>>(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  //============================================================
  //POST
  //============================================================
  
  /**
   * 게시글 등록하기
   */
  postPost(postJson:posts): any {
    var accessToken = "";
    this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
    });

    if(!accessToken || accessToken == "" || this.isTokenExpired(accessToken)){
      // alert("토큰 리프레시");
      this.cognitoUtil.refresh();
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
      });
    }

    const requestUrl = `${environment.apiUrl}posts`;
    let param = {
      accessToken: accessToken,
      payload: postJson
    }
    return this.http.post(requestUrl, param).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  /**
   * 코멘트 등록하기
   */
  postComment(commentJson:comment): any {
    const requestUrl = `${environment.apiUrl}comment`;
    const param = {
      payload: commentJson
    }

    return this.http.post(requestUrl, param).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  /**
   * 이미지 등록하기
   */
  uploadImage(type:string ,image: File): any {
    var accessToken = "";
    this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
    });

    if(!accessToken || accessToken == "" || this.isTokenExpired(accessToken)){
      // alert("토큰 리프레시");
      this.cognitoUtil.refresh();
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
      });
    }

    const requestUrl = `${environment.apiUrl}file/${type}`;

    const formData = new FormData();
    formData.append('file', image);

    return this.http.post(requestUrl, formData, {
      headers: {accessToken: accessToken}
    })
    // .timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: err});
    });
  }

    /**
   * 이모티콘 등록하기
   */
  postEmoticon(emoticonName:string ,image: File): any {
    var accessToken = "";
    this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
    });

    if(!accessToken || accessToken == "" || this.isTokenExpired(accessToken)){
      // alert("토큰 리프레시");
      this.cognitoUtil.refresh();
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
      });
    }

    const requestUrl = `${environment.apiUrl}admin/emoticon`;

    const formData = new FormData();
    formData.append('file', image);
    var Buffer = require("buffer").Buffer;
    emoticonName = Buffer.from(emoticonName).toString('base64');

    return this.http.post(requestUrl, formData, {
      headers: {
        accessToken: accessToken,
        emoticonName: emoticonName
      }
    })
    // .timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: err});
    });
  }

  //============================================================
  //PUT
  //============================================================
  /**
   * 게시글 수정하기
   */
  putPostGoodBad(postId:number, userId:number, isGood:boolean): any {
    var accessToken = "";
    this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
    });

    if(!accessToken || accessToken == "" || this.isTokenExpired(accessToken)){
      // alert("토큰 리프레시");
      this.cognitoUtil.refresh();
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
      });
    }

    const requestUrl = `${environment.apiUrl}posts`;

    let param = {
      accessToken: accessToken,
      payload: {
        postId: postId,
        userId: userId,
        isGood: isGood
      }
    }
    
    return this.http.put(requestUrl, param).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  /**
   * 프로필 수정하기
   */
  putUserInfo(userId:number, intro:string, description:string, profileImage:string): any {
    var accessToken = "";
    this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
    });

    if(!accessToken || accessToken == "" || this.isTokenExpired(accessToken)){
      // alert("토큰 리프레시");
      this.cognitoUtil.refresh();
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
      });
    }

    const requestUrl = `${environment.apiUrl}users`;

    let param = {
      accessToken: accessToken,
      payload: {
        userId: userId,
        intro: intro,
        description: description,
        profileImage: profileImage
      }
    }
    
    return this.http.put(requestUrl, param).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  //============================================================
  //DELETE
  //============================================================
  /**
   * 게시글 삭제
   */
  deletePost(postId:number): any {
    var accessToken = "";
    this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
    });

    if(!accessToken || accessToken == "" || this.isTokenExpired(accessToken)){
      // alert("토큰 리프레시");
      this.cognitoUtil.refresh();
      this.cognitoUtil.getAccessToken({
        callback(): void{},
        callbackWithParam(result: any): void {
          accessToken = result;
        }
      });
    }
    
    const requestUrl = `${environment.apiUrl}posts?postId=${postId}&accessToken=${accessToken}`;

    return this.http.delete(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  /**
   * 코멘트 삭제
   */
  deleteComment(commentId:number, postId:number): any {
    const requestUrl = `${environment.apiUrl}comment?commentId=${commentId}&postId=${postId}`;

    return this.http.delete(requestUrl).timeout(timeout)
    .catch((err:Response) => {
      return Observable.throw({error: {
        text: JSON.stringify(err)
      }});
    });
  }

  //============================================================
  //에러 데이터
  //============================================================
  errorPost:posts = {
    postsID: 999999,
    postClassify: 99,
    studentNum: 99,
    publisherId: 9999,
    publisher: '에러',
    publisherIntro: '게시글을 불러오지 못하였습니다.',
    publisherImg: null,
    images: ["/../assets/testImage.jpg"],
    title: '게시글을 불러오지 못하였습니다.',
    body: '',
    good: 9,
    bad: 99,
    postDate: null,
    marker: null,
    tag: null,
    commentCount: 99
  }

  errorComment:comment = {
    commentId: 999999,
    postId:9999,
    commentDate: new Date('9/99/99'),
    studentNum: 99,
    userId: 9999,
    userName: "에러",
    userImg: null,
    emoticon: null,
    comment: "코멘트를 불러오지 못하였습니다.",
    good: 0
  }

  errorUser:user = {
    userId: 999999,
    name: '에러',
    intro: '유저정보를 불러오지 못하였습니다.',
    description: '유저정보를 불러오지 못하였습니다.',
    studentNum:99,
    recentDate: new Date('9/9/99'),
    image: null,
    subImage01: null
  }

  isTokenExpired(token: string) {
    let jwtHelper = new JwtHelperService();
    return jwtHelper.isTokenExpired(token);
  }
}