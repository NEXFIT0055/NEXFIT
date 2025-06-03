CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 原始密碼: P+#4c1tl6S
INSERT INTO users (email, password_hash) VALUES ('tcao@gmail.com', '$2a$08$0kIlCLXSsdm0eIo1Vwp6revszQKZiGXEI9yCk/YtZC9nGWj5gAnt.');

-- 原始密碼: &oOrHXZfc6
INSERT INTO users (email, password_hash) VALUES ('gangliang@tian.com', '$2a$08$p7EYnWjrm3yPo4xP5oCuK.PsemsQ4NEELaCgOxwHzwCuKMaxmfiJ2');

-- 原始密碼: ^@E9vggA$9
INSERT INTO users (email, password_hash) VALUES ('jiangyang@yahoo.com', '$2a$08$RYQdFEwRfqotPSmdmOJFBugZ2i47TqyvMAPoZI5yPcsXvzhfvUobi');

-- 原始密碼: Cx4H1_EKT%
INSERT INTO users (email, password_hash) VALUES ('xia10@meng.tw', '$2a$08$GQYZgsIJMGbLhAuIG6znquPsy1yTjQwi.uwEORcgqewe/unR6Clee');

-- 原始密碼: !F9T%6YgZ9
INSERT INTO users (email, password_hash) VALUES ('junye@gmail.com', '$2a$08$AWzaIaUfoeBqIIT3j.VJ6O7SgfOjafy3CoGC/lM6JsnqHCOyKjGwS');

-- 原始密碼: G*0G4oE^(*
INSERT INTO users (email, password_hash) VALUES ('fangchang@yahoo.com', '$2a$08$FehSjmaTxt3jULteCmrDNeZYeZb5/lVMZJSm3lBt1g2Nuifc3Roe6');

-- 原始密碼: %m5Z)9Ogci
INSERT INTO users (email, password_hash) VALUES ('yanghou@xue.com', '$2a$08$PAjwY5w3FhbgNhpyx0cBHO40mArnYvksuSEX3pEfhW6mlJGbET5jq');

-- 原始密碼: Wu9Ix3ZRd^
INSERT INTO users (email, password_hash) VALUES ('pengguiying@dai.com', '$2a$08$BK7QUqtXXGnYD0231tXwnu/lwpK2OfsUM1pV9JewmQevEKTS9AO8e');

-- 原始密碼: J(2RuUe8a!
INSERT INTO users (email, password_hash) VALUES ('xiulan63@hotmail.com', '$2a$08$.T65Rx.IH1rnc28betROruAM/PaV4g7csE90bH9ylQWc0zauOqfSW');

-- 原始密碼: _uR6Tdhky1
INSERT INTO users (email, password_hash) VALUES ('huangwei@fan.com', '$2a$08$jrLov/ijjL.NAy65JSEOF.4zAsUJWF4HUzXYGhPoYbn2lWERp0ofS');

-- 原始密碼: UtjA4$FY1_
INSERT INTO users (email, password_hash) VALUES ('leiye@cui.tw', '$2a$08$kE7Gf1H/oNXYOKTD2w.3D.a4Q8r3w/q42macsQ56nEhYA0tLNDQQS');

-- 原始密碼: Q@8(+LPdyh
INSERT INTO users (email, password_hash) VALUES ('mxie@gmail.com', '$2a$08$jdZ//Fs3ifz54iVzAFivBeH0LXbU5yQQkI4WahNHPh8mrCrL8yJiq');

-- 原始密碼: P(2kRaBSe6
INSERT INTO users (email, password_hash) VALUES ('huguiying@hotmail.com', '$2a$08$35ihNcjQ.k1T2qXK5Zo0n.tzEIC0GZmtS/2UZ8MUnTBgtfTyCW2Eq');

-- 原始密碼: (*QDPmKh%6
INSERT INTO users (email, password_hash) VALUES ('fang52@bai.com', '$2a$08$DQCPgWWVufx/0dr8X/bQbu.lQmcSrHwN8Dd8xfQ3FuzSkor/U.et6');

-- 原始密碼: Ui+2U2krF9
INSERT INTO users (email, password_hash) VALUES ('gaoyong@hotmail.com', '$2a$08$06cLkdRfmPHJgaEdmwmwIukNQuykC5ZTNagVd4X4.GpF4RWnbAQYK');

-- 原始密碼: %ft3rPLfCM
INSERT INTO users (email, password_hash) VALUES ('jing75@ding.tw', '$2a$08$Uxi5bE3UUYATHYxUXKsf.upJcDMwlXUV1YZPnTfda9oJhyR/pvuHG');

-- 原始密碼: _5Ofd^)uWw
INSERT INTO users (email, password_hash) VALUES ('taoyong@wu.com', '$2a$08$StoqPCshLX9uPY7EQ8ACaO0tAHMYA4Wr9c9Lx1Qfsri2SmA0fIM.e');

-- 原始密碼: 1l63UQQt@F
INSERT INTO users (email, password_hash) VALUES ('junhao@gmail.com', '$2a$08$0vfz6SxoRdyGrNNX7NU9teOu0dt.lS7HM.GgBP5FsdGbcxM6mxV0a');

-- 原始密碼: S(o8FFp($4
INSERT INTO users (email, password_hash) VALUES ('qiangdai@yahoo.com', '$2a$08$60CIjgnQQoUNNsxxNS0e9u5mhOarJos9u/QA0jr8Zx4A8w2nbaQi2');

-- 原始密碼: 3&y5CNq6r*
INSERT INTO users (email, password_hash) VALUES ('gang34@hotmail.com', '$2a$08$4UepJtY0PzBy0LELqinMdeYtFDpPIt9X8BJC4Ckd5b4rMAu2PP3D.');

-- 原始密碼: Gp2Wbvq&c_
INSERT INTO users (email, password_hash) VALUES ('eguo@feng.tw', '$2a$08$lV7GzxJ/l6EuqmveUAHbrOz2OjG.ShPXpVyNpZQZAASd/7fcKkvN6');

-- 原始密碼: M&Wp0GmOu6
INSERT INTO users (email, password_hash) VALUES ('yong78@qian.net', '$2a$08$u2zyLQzvSGq2eqHnEuZKSOu38m7MYxSfoOonD8u3q.2aVsmCtjT02');

-- 原始密碼: b8CPBceZ#0
INSERT INTO users (email, password_hash) VALUES ('liaona@yin.com', '$2a$08$BPP39GDWazBV33tYblU/RObYhwiGIftDlPT6k1R9s8RoPmBa8n2Dm');

-- 原始密碼: (Wesujz_97
INSERT INTO users (email, password_hash) VALUES ('uluo@yahoo.com', '$2a$08$Iclf8arKx35JkJ/CG8.LguppgwQP2gNfudN42ENaYveTpehOBgesK');

-- 原始密碼: ZwO+%1e6+1
INSERT INTO users (email, password_hash) VALUES ('haoyan@han.com', '$2a$08$wAsxpyTvp8z7ViFFnSUmHOlrf5MRFofHjR.DZj4geg/ktT3uM3.cW');

-- 原始密碼: 6aUtQWm@#W
INSERT INTO users (email, password_hash) VALUES ('jing19@gmail.com', '$2a$08$Wp/.Otohr37Cq56Ew4nF9eTyxaxFw/UuFDzVKli72AMvT5fCixjDW');

-- 原始密碼: T%nH^p6i@1
INSERT INTO users (email, password_hash) VALUES ('lijie@gmail.com', '$2a$08$3HcQsyPOeDVDdqBrLnfzkeTi6ZIezifOou7ONs/WaI7RHODqU7DoW');

-- 原始密碼: 34fBbm0n!L
INSERT INTO users (email, password_hash) VALUES ('gang21@liang.net', '$2a$08$Ik6/d0YFzOKZ6A3OML.utuhHd6tYmU3yPQIvr2FwbQVkOK/ausWd6');

-- 原始密碼: M!0OJAnyD9
INSERT INTO users (email, password_hash) VALUES ('nazeng@yan.tw', '$2a$08$WC0y40LOaHo9iBXWNqQYdeuSzqQbHT5hnCXuNKGsLgazxXNq2O4GG');

-- 原始密碼: 2NGfIJyb_6
INSERT INTO users (email, password_hash) VALUES ('sqian@hotmail.com', '$2a$08$eozTQbJh/woniBm3KEhyXuc25YMjsUtfTn951DtQUtMMasf8VYnhy');

-- 原始密碼: 8y34@93j*z
INSERT INTO users (email, password_hash) VALUES ('yuzijohn@hello.com', '$2a$08$8.1xc4rV7t2Oc1mTTvDO1uMtxNukPSOOPYGy4qKHmY7ueA/zy2NGS');

-- 原始密碼: sheepranjuice
INSERT INTO users (email, password_hash) VALUES ('sheepranyoung@gmail.com', '$2a$10$7O/9.nx2zonpgiLVWhpcLOOhJTRu2awz69pqBIAZmwoeq.aWzPPhW');