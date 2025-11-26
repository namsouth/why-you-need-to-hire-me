techstack: 
- spring boot 
- jwt 
    - sign the content with privateKey
    - with user information
    - with user roles 
    - expireTime 
    - refresh token 
- user management 
    - user 
        - uuid (PK), username, password ( digest ), fullname, createdTime, createdBy 
    - role 
        - uuid (PK), roleName, 
    - userRoleMap
        - uuid , userId , roleId , createTime , expireTime  
    - login session
- sqlite 
    - get the sqlite path from configuration object which is share in multiple spring boot service
    - handle transactin 
- key managment 
    - uuid, keyCode, publicKey, privateKey, createdDate, ipWhiteList, ipBlackList, expireDate 
- encryption / decryption 




target: 
- proper error handling
- parameter validation 
- make use of spring boot annotation
- for every class / method should have corresponding test case 
