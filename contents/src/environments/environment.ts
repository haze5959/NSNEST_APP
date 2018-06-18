// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  //Cognito 관련
  region: 'ap-northeast-2',
  IdentityPoolId: '',
  UserPoolId: 'ap-northeast-2_PzeoW49Lp',
  ClientId: '7k319206hpp5uleb2gorm1tncj',

  cognito_idp_endpoint: '',
  cognito_identity_endpoint: '',
  sts_endpoint: '',

  //서버주소
  apiUrl: 'http://nsnest.iptime.org:3000/api/',
  fileUrl: 'http://nsnest.iptime.org:3000/',
  // apiUrl: 'http:///localhost:3000/api/',
  // fileUrl: 'http:///localhost:3000/',

  //가입페이지
  registPage: 'http://nsnest.s3-website.ap-northeast-2.amazonaws.com/'
};
