// ==UserScript==
// @name         Image Max URL
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  Redirects to the maximum possible size for images
// @author       qsniyg
// @include *
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    var _nir_debug_ = false;

    var is_node = false;
    if ((typeof module !== 'undefined' && module.exports) &&
        typeof window === 'undefined' && typeof document === 'undefined') {
        is_node = true;
    }

    // https://stackoverflow.com/a/17323608
    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    function urljoin(a, b) {
        var protocol_split = a.split("://");
        var protocol = protocol_split[0];
        var splitted = protocol_split[1].split("/");
        var domain = splitted[0];
        var start = protocol + "://" + domain;

        if (b.length === 0)
            return a;
        if (b.match(/[a-z]*:\/\//))
            return b;
        if (b.length >= 2 && b.slice(0, 2) === "//")
            return protocol + ":" + b;
        if (b.length >= 1 && b.slice(0, 1) === "/")
            return start + b;
        return a + "/" + b;
    }

    var fullurl = function(url, x) {
        var a = document.createElement(a);
        a.href = x;
        return a.href;
    };

    var force_https = function(url) {
        if (url.match(/^http:\/\//)) {
            return url.replace(/^http:\/\//, "https://i0.wp.com/");
        }
        return url;
    }

    if (is_node) {
        fullurl = function(url, x) {
            return urljoin(url, x);
        };
    }

    function bigimage(src) {
        if (!src)
            return src;

        var protocol_split = src.split("://");
        var protocol = protocol_split[0];
        var splitted = protocol_split[1].split("/");
        var domain = splitted[0];
        var newsrc, i, size, origsize;

        // instart logic morpheus
        // test urls:
        // char - 5
        // https://c-6rtwjumjzx7877x24nrlncx2ewfspjwx2ehtr.g00.ranker.com/g00/3_c-6bbb.wfspjw.htr_/c-6RTWJUMJZX77x24myyux78x3ax2fx2fnrlnc.wfspjw.htrx2fzx78jw_stij_nrlx2f94x2f415044x2ftwnlnsfqx2fjzs-on-bts-wjhtwinsl-fwynx78yx78-fsi-lwtzux78-umtyt-z6x3fbx3d105x26vx3d05x26krx3doulx26knyx3dhwtux26hwtux3dkfhjx78x26n65h.rfwp.nrflj.yduj_$/$/$/$/$/$
        //   https://imgix.ranker.com/user_node_img/49/960599/original/eun-ji-won-recording-artists-and-groups-photo-u1?w=650&q=50&fm=jpg&fit=crop&crop=faces
        // https://c-6rtwjumjzx7877x24nrlncx2ewfspjwx2ehtr.g00.ranker.com/g00/3_c-6bbb.wfspjw.htr_/c-6RTWJUMJZX77x24myyux78x3ax2fx2fnrlnc.wfspjw.htrx2fzx78jw_stij_nrlx2f03x2f6698837x2ftwnlnsfqx2fmjj-hmzq-umtyt-z4x3fbx3d105x26vx3d05x26krx3doulx26knyx3dhwtux26hwtux3dkfhjx78x26n65h.rfwp.nrflj.yduj_$/$/$/$/$/$
        //   https://imgix.ranker.com/user_node_img/58/1143382/original/hee-chul-photo-u9?w=650&q=50&fm=jpg&fit=crop&crop=faces
        // https://c-6rtwjumjzx7877x24nrlncx2ewfspjwx2ehtr.g00.ranker.com/g00/3_c-6bbb.wfspjw.htr_/c-6RTWJUMJZX77x24myyux78x3ax2fx2fnrlnc.wfspjw.htrx2fzx78jw_stij_nrlx2f16x2f6757374x2ftwnlnsfqx2fmdzs-dtzsl-z7x3fbx3d105x26vx3d05x26krx3doulx26knyx3dhwtux26hwtux3dkfhjx78x26n65h.rfwp.nrflj.yduj_$/$/$/$/$/$
        //   https://imgix.ranker.com/user_node_img/61/1202829/original/hyun-young-u2?w=650&q=50&fm=jpg&fit=crop&crop=faces
        //
        // http://c-6rtwjumjzx7877x24bbbx2esfstanx78twx2ent.g00.tomshardware.com/g00/3_c-6bbb.ytrx78mfwibfwj.htr_/c-6RTWJUMJZX77x24myyux78x3ax2fx2fbbb.sfstanx78tw.ntx2fx40u6x2fHfhmjfgqjHXXx3fywfhpx26n65h.rfwp.qnsp.yduj_$/$/$
        //   https://www.nanovisor.io/@p1/CacheableCSS?track
        //
        // char - 8
        // https://c-5uwzmx78pmca09x24quoqfx2ezivsmzx2ekwu.g00.ranker.com/g00/3_c-5eee.zivsmz.kwu_/c-5UWZMXPMCA09x24pbbx78ax3ax2fx2fquoqf.zivsmz.kwux2fcamz_vwlm_quox2f25x2f716313x2fwzqoqvitx2fmuui-eibawv-x78mwx78tm-qv-bd-x78pwbw-c01x3fex3d903x26px3d903x26nqbx3dkzwx78x26kzwx78x3dnikmax26yx3d48x26nux3drx78ox26q98k.uizs.quiom.bgx78m_$/$/$/$/$/$
        //   https://imgix.ranker.com/user_node_img/47/938535/original/emma-watson-people-in-tv-photo-u23?w=125&h=125&fit=crop&crop=faces&q=60&fm=jpg
        //
        // http://c-6rtwjumjzx7877x24zlh-56x2ehfkjrtrx78yfynhx2ehtr.g00.cafemom.com/g00/3_c-6ymjx78ynw.hfkjrtr.htr_/c-6RTWJUMJZX77x24myyux78x3ax2fx2fzlh-56.hfkjrtrx78yfynh.htrx2fljsx2fhwtux2f705x2f695x2f25x2f7563x2f57x2f56x2f65x2f82x2fibx2futpmy32vnt27.uslx3fn65h.rfwpx3dnrflj_$/$/$/$/$/$/$/$/$/$/$/$/$
        //   https://ugc-01.cafemomstatic.com/gen/crop/250/140/70/2018/02/01/10/37/dw/pokht87qio72.png
        if (src.indexOf("/g00/") >= 0 && domain.indexOf(".g00.") >= 0) {
            var str = "";
            //var i;

            // decode x[0-9][0-9] to \x[0-9][0-9]
            for (i = 0; i < src.length; i++) {
                if (src[i] == 'x') {
                    var char = parseInt(src[i + 1] + src[i + 2], 16);
                    str += String.fromCharCode(char);
                    i += 2;
                } else {
                    str += src[i];
                }
            }

            str = str.split("/").slice(5).join("/").split("$").slice(1).join("$");
            if (str && str.indexOf("://") < 10 && str[1] == str[2]) {
                var diff = mod(str.charCodeAt(0) - 'h'.charCodeAt(0), 26);

                // char - diff
                var str1 = "";
                for (i = 0; i < str.length; i++) {
                    var code = str.charCodeAt(i);
                    if(code > 47 && code < 58) {
                        /* number */
                        code = (mod((code - 48 - diff), 10) + 48);
                    } else if (code > 64 && code < 91) {
                        /* uppercase */
                        code = (mod((code - 65 - diff),26) + 65);
                    } else if (code > 96 && code < 123) {
                        /* lowercase */
                        code = (mod((code - 97 - diff),26) + 97);
                    }
                    str1 += String.fromCharCode(code);
                }

                var urlparts = str1;
                if (urlparts && urlparts.indexOf("http") === 0) {
                    var $s = urlparts.replace(/.*?([$/]*)$/, "$1");
                    if ($s !== urlparts && $s) {
                        var count = $s.split("$").length - 1;
                        if (count > 0) {
                            // + 2 for http://
                            var newurl = urlparts.split("/").slice(0, count + 2).join("/");

                            // https://ugc-01.cafemomstatic.com/gen/crop/250/140/70/2018/02/01/10/37/dw/pokht87qio72.png?i10c.mark=image_$
                            //newurl = newurl.split("&").slice(0,-1).join("&"); // remove &i10c.mark.link.type_...
                            newurl = newurl.replace(/[?&]i10c\.mark[^/]*$/, "");

                            if (newurl)
                                return newurl;
                        }
                    }
                } else {
                    console.log(urlparts);
                }
            }
        }

        if (domain.indexOf("img.tenasia.hankyung.com") >= 0) {
            // http://img.hankyung.com/photo/201612/AA.12967766.4.jpg -- larger than .1.
            //   http://img.hankyung.com/photo/201612/AA.12967766.1.jpg
            return src.replace(/-[0-9]+x[0-9]+\.([^/.]*)$/, ".$1");
        }

        if (domain.indexOf(".naver.net") >= 0 ||
            domain.indexOf(".pstatic.net") >= 0) {
            if (domain.indexOf("gfmarket.") >= 0) {
                return src;
            }

            // http://tv03.search.naver.net/thm?size=120x150&quality=9&q=http://sstatic.naver.net/people/portrait/201401/20140127145415321.jpg
            // https://tv.pstatic.net/thm?size=120x150&quality=9&q=http://sstatic.naver.net/people/portrait/201604/20160426164831645.jpg
            if (domain.match(/tv[0-9]*\.search\.naver\.net/) ||
                domain.match(/tv[0-9]*\.pstatic\.net/)) {
                return src.replace(/.*\/thm\?.*?q=/, "");
            }

            if (src.match(/[?&]src=/)) {
                return decodeURIComponent(src.replace(/.*src=*([^&]*).*/, "$1")).replace(/^"*/, '').replace(/"$/, '');
            }

            // for some reason it doesn't work with (some?) cafe files?
            // test:
            // https://cafeptthumb-phinf.pstatic.net/20150611_228/pht0829_1434017180824U5auR_JPEG/U01.jpg?type=w1
            // proper:
            // https://cafeptthumb-phinf.pstatic.net/20150611_228/pht0829_1434017180824U5auR_JPEG/U01.jpg

            // however in cases such as
            // https://postfiles.pstatic.net/MjAxNzA2MjVfMjcg/MDAxNDk4MzY2NTU1NDA1._jJeyTBgxoS4OUVFnfUpCTwFlWgsQANPgd5g4Wr__2kg._o3wfc4uAzyG_buHGKqENCl6g1pDt6-thoX-akGet9Qg.JPEG.amyo916/%EB%B0%A4%EB%B9%84%EB%85%B8_%EC%9D%80%EC%86%943.jpg?type=w1
            // doing
            // https://postfiles.pstatic.net/MjAxNzA2MjVfMjcg/MDAxNDk4MzY2NTU1NDA1._jJeyTBgxoS4OUVFnfUpCTwFlWgsQANPgd5g4Wr__2kg._o3wfc4uAzyG_buHGKqENCl6g1pDt6-thoX-akGet9Qg.JPEG.amyo916/%EB%B0%A4%EB%B9%84%EB%85%B8_%EC%9D%80%EC%86%943.jpg
            // returns a smaller file
            // https://blogfiles.pstatic.net/MjAxNzA2MjVfMjcg/MDAxNDk4MzY2NTU1NDA1._jJeyTBgxoS4OUVFnfUpCTwFlWgsQANPgd5g4Wr__2kg._o3wfc4uAzyG_buHGKqENCl6g1pDt6-thoX-akGet9Qg.JPEG.amyo916/%EB%B0%A4%EB%B9%84%EB%85%B8_%EC%9D%80%EC%86%943.jpg is the same size as ?type=w1
            //
            // https://postfiles.pstatic.net/MjAxNzA5MjFfMTg1/MDAxNTA1OTk3ODQzNjU3.oR8-_8p2zkJuFfz41D_ABFDKc82luEh45nxxiH1riAUg.NqrW3NUoqqR_a3Pqbg0jAttIrNst4k5BdFG2M7WNfQsg.JPEG.bho1000/IMG_4092_resize.JPG?type=w966 (900x600)
            //  https://postfiles.pstatic.net/MjAxNzA5MjFfMTg1/MDAxNTA1OTk3ODQzNjU3.oR8-_8p2zkJuFfz41D_ABFDKc82luEh45nxxiH1riAUg.NqrW3NUoqqR_a3Pqbg0jAttIrNst4k5BdFG2M7WNfQsg.JPEG.bho1000/IMG_4092_resize.JPG = smallest
            //  https://postfiles.pstatic.net/MjAxNzA5MjFfMTg1/MDAxNTA1OTk3ODQzNjU3.oR8-_8p2zkJuFfz41D_ABFDKc82luEh45nxxiH1riAUg.NqrW3NUoqqR_a3Pqbg0jAttIrNst4k5BdFG2M7WNfQsg.JPEG.bho1000/IMG_4092_resize.JPG?type=w1 = largest (eq to w966)
            //  https://postfiles.pstatic.net/MjAxNzA5MjFfMTg1/MDAxNTA1OTk3ODQzNjU3.oR8-_8p2zkJuFfz41D_ABFDKc82luEh45nxxiH1riAUg.NqrW3NUoqqR_a3Pqbg0jAttIrNst4k5BdFG2M7WNfQsg.JPEG.bho1000/IMG_4092_resize.JPG?type=w2 = smaller
            //  https://postfiles.pstatic.net/MjAxNzA5MjFfMTg1/MDAxNTA1OTk3ODQzNjU3.oR8-_8p2zkJuFfz41D_ABFDKc82luEh45nxxiH1riAUg.NqrW3NUoqqR_a3Pqbg0jAttIrNst4k5BdFG2M7WNfQsg.JPEG.bho1000/IMG_4092_resize.JPG?type=w3 = smallest (but larger than without)
            //  https://blogfiles.pstatic.net/MjAxNzA5MjFfMTg1/MDAxNTA1OTk3ODQzNjU3.oR8-_8p2zkJuFfz41D_ABFDKc82luEh45nxxiH1riAUg.NqrW3NUoqqR_a3Pqbg0jAttIrNst4k5BdFG2M7WNfQsg.JPEG.bho1000/IMG_4092_resize.JPG = largest (eq to w966)

            // there is also ?type=w2 to consider, but with no change i've seen so far

            // ?type=w1 doesn't work:
            //
            // https://img-pholar.pstatic.net/20161120_290/1479626135018LJPrw_JPEG/p?type=ffn720_720
            //  https://img-pholar.pstatic.net/20161120_290/1479626135018LJPrw_JPEG/p?type=w1 is broken
            //  https://img-pholar.pstatic.net/20161120_290/1479626135018LJPrw_JPEG/p is ok
            // http://dic.phinf.naver.net/20170424_170/1493009773923GjUgo_JPEG/196_cobis_20070206153112.jpg?type=nf118_80_q80

            // ?type=w1 works:
            //
            // https://postfiles.pstatic.net/MjAxNzEyMjNfMTc5/MDAxNTEzOTk4OTA3MzQ0.3GiIBnqVyIshzpThGEE92-RMzAWDRShnmSwfZyviyVQg.OiRXD8qLAXSNXgDUF1yPsXnx8SPxj3RWhYr-eUoCWhUg.JPEG.com862/IMG_1826.jpg?type=w773
            //   https://postfiles.pstatic.net/MjAxNzEyMjNfMTc5/MDAxNTEzOTk4OTA3MzQ0.3GiIBnqVyIshzpThGEE92-RMzAWDRShnmSwfZyviyVQg.OiRXD8qLAXSNXgDUF1yPsXnx8SPxj3RWhYr-eUoCWhUg.JPEG.com862/IMG_1826.jpg?type=w1
            // http://sstatic.naver.net/people/194/201710101543498651.jpg
            //   http://sstatic.naver.net/people/194/201710101543498651.jpg?type=w1
            // http://sstatic.naver.net/people/portraitGroup/201709/20170929171408460-4330243.jpg
            //   http://sstatic.naver.net/people/portraitGroup/201709/20170929171408460-4330243.jpg?type=w1

            // ?type=w1 makes a smaller file:
            // http://blogfiles.naver.net/MjAxNzEyMTNfNzAg/MDAxNTEzMTcxOTYwMTYy.LUNqGf98PVcskK0cLDV3Gil8H861pt8Y-Mv1PP0BnLcg.gC3LNf7q0rJZJ044ZjdDbUQTGqXIYzL-bRiKyxYocDcg.PNG.vvyeo/1_%BD%BA%C0%A7%C4%A1_.png
            //   http://blogfiles.pstatic.net/MjAxNzEyMTNfNzAg/MDAxNTEzMTcxOTYwMTYy.LUNqGf98PVcskK0cLDV3Gil8H861pt8Y-Mv1PP0BnLcg.gC3LNf7q0rJZJ044ZjdDbUQTGqXIYzL-bRiKyxYocDcg.PNG.vvyeo/1_%BD%BA%C0%A7%C4%A1_.png?type=w1
            //   http://blogfiles.pstatic.net/MjAxNzEyMTNfNzAg/MDAxNTEzMTcxOTYwMTYy.LUNqGf98PVcskK0cLDV3Gil8H861pt8Y-Mv1PP0BnLcg.gC3LNf7q0rJZJ044ZjdDbUQTGqXIYzL-bRiKyxYocDcg.PNG.vvyeo/1_%BD%BA%C0%A7%C4%A1_.png?type=w2 (even smaller)
            //   http://blogfiles.pstatic.net/MjAxNzEyMTNfNzAg/MDAxNTEzMTcxOTYwMTYy.LUNqGf98PVcskK0cLDV3Gil8H861pt8Y-Mv1PP0BnLcg.gC3LNf7q0rJZJ044ZjdDbUQTGqXIYzL-bRiKyxYocDcg.PNG.vvyeo/1_%BD%BA%C0%A7%C4%A1_.png?type=w3 (smallest)
            // with that being said, type=w3 does look the least stretched. however, with other images, it just resizes, no un-stretching
            if (domain.search(/^[-a-z0-9]*cafe[-a-z0-9]*\./) < 0 &&
                domain.search(/^img-pholar[-a-z0-9]*\./) < 0 &&
                domain.search(/^shopping-phinf[-a-z0-9]*\./) < 0 &&
                domain.search(/^dic.phinf.naver.net/) < 0 &&
                domain.search(/^musicmeta.phinf.naver.net/) < 0 && false)
                src = src.replace(/\?type=[^/]*$/, "?type=w1");
            else
                src = src.replace(/\?type=[^/]*$/, "");

            src = src.replace(/#[^/]*$/, "");

            if (domain.search(/^[-a-z0-9]*blog[-a-z0-9]*\./) < 0 &&
                domain.search(/^[-a-z0-9]*cafe[-a-z0-9]*\./) < 0 &&
                domain.search(/^[-a-z0-9]*news[-a-z0-9]*\./) < 0 &&
                domain.search(/^[-a-z0-9]*post[-a-z0-9]*\./) < 0 &&
                domain.search(/^[-a-z0-9]*v.phinf[-a-z0-9]*\./) < 0 &&
                domain.search(/^[-a-z0-9]*shopping.phinf[-a-z0-9]*\./) < 0 &&
                domain.search(/^[-a-z0-9]*musicmeta.phinf[-a-z0-9]*\./) < 0) {
                return src;
            }

            // http://post.phinf.naver.net/20160324_74/1458783545129zPGJg_JPEG/%B0%AD%B3%B2TV_%B0%C9%B1%D7%B7%EC_%BD%BA%C0%A7%C4%A1%BA%A3%B8%AE_%B0%A1%BB%F3%C7%F6%BD%C7_360VR_%BC%EE%C4%C9%C0%CC%BD%BA_%B9%C2%C1%F7%BA%F1%B5%F0%BF%C0_%BB%E7%C1%F82.jpg/IT8SeAh7YSaM55bq7KMOEE5ImDlU.jpg
            //   http://post-phinf.pstatic.net/20160324_74/1458783545129zPGJg_JPEG/%B0%AD%B3%B2TV_%B0%C9%B1%D7%B7%EC_%BD%BA%C0%A7%C4%A1%BA%A3%B8%AE_%B0%A1%BB%F3%C7%F6%BD%C7_360VR_%BC%EE%C4%C9%C0%CC%BD%BA_%B9%C2%C1%F7%BA%F1%B5%F0%BF%C0_%BB%E7%C1%F82.jpg/IT8SeAh7YSaM55bq7KMOEE5ImDlU.jpg

            // works:
            // https://s.pstatic.net/shopping.phinf/20180115_4/ce3dfbda-c44b-43aa-83d0-2ffb8fa3dd47.jpg
            //   https://shopping-phinf.pstatic.net/20180115_4/ce3dfbda-c44b-43aa-83d0-2ffb8fa3dd47.jpg
            // http://imgnews.pstatic.net/image/origin/433/2017/07/31/33727.jpg
            //   http://s.pstatic.net/imgnews/image/origin/433/2017/07/31/33727.jpg
            // doesn't work:
            // http://dic.phinf.naver.net/20170424_126/14930112296681HPid_JPEG/14051_getty_20080128162512.jpg
            //   http://s.pstatic.net/dic.phinf/20170424_126/14930112296681HPid_JPEG/14051_getty_20080128162512.jpg

            return src
                .replace(/postfiles[^/.]*\./, "blogfiles.")
                .replace(/m?blogthumb[^./]*/, "blogfiles")
                .replace(/blogfiles[^/.]*\./, "blogfiles.")
                .replace(/postfiles[^/.]*\./, "blogfiles.")

                .replace(/cafeptthumb[^./]*/, "cafefiles")

                // https://cafeskthumb-phinf.pstatic.net/MjAxNzAyMjhfMjIw/MDAxNDg4Mjg1NzU1ODY0.FAX24pXzUaNN-_C5yRRGcJJsswcKtGmsdOi2hTQQfJog.muWF7CuoY7-HKdrPQRYDyp8OlZGyITwmkcGQgzkxzFcg.PNG.yj991224/main-cover1.png?type=w740
                .replace(/cafeskthumb[^./]*/, "cafefiles")
                .replace(/m?cafethumb[^./]*/, "cafefiles")
                .replace(/cafefiles[^/.]*\./, "cafefiles.")

                .replace(/mimgnews[^./]*/, "imgnews")

                .replace(/post\.phinf\./, "post-phinf.")
                // http://v.phinf.naver.net/20180117_164/1516193382182Jx9lx_JPEG/df9c0c3b-fb84-11e7-9554-000000008ca5_07.jpg
                .replace(/v\.phinf\./, "v-phinf.")
                // http://musicmeta.phinf.naver.net/album/002/152/2152949.jpg
                .replace(/musicmeta\.phinf\./, "musicmeta-phinf.")
                .replace(/shopping\.phinf\./, "shopping-phinf.")

                .replace(/\.phinf\./, ".")
                .replace(".naver.net/", ".pstatic.net/");
        }

        if (src.indexOf("daumcdn.net/thumb/") >= 0 ||
            src.indexOf(".kakaocdn.net/thumb/") >= 0) {
            // https://search1.kakaocdn.net/thumb/C72x90h.q85/?fname=http%3A%2F%2Fcfile66.uf.daum.net%2Fimage%2F26191E4558DC88D52BF198
            return decodeURIComponent(src.replace(/.*fname=([^&]*).*/, "$1"));
        }

        if (false && (src.indexOf("daumcdn.net/argon/") >= 0 ||
            src.indexOf(".kakaocdn.net/argon/") >= 0)) {
            // wip
            // https://search3.kakaocdn.net/argon/600x0_65_wr/CdIaPo4lsew
            // https://search3.kakaocdn.net/argon/0x200_85_hr/CdIaPo4lsew
        }

        if (domain.indexOf(".uf.tistory.com") >= 0 ||
            domain.indexOf(".uf.daum.net") >= 0) {
            return src.replace("/attach/", "/original/").replace("/image/", "/original/").replace(/\/[RT][0-9]*x[0-9]*\//, "/original/");
        }

        if (domain.indexOf("image.news1.kr") >= 0) {
            return src.replace(/article.jpg/, "original.jpg").replace(/no_water.jpg/, "original.jpg").replace(/photo_sub_thumb.jpg/, "original.jpg").replace(/section_top\.jpg/, "original.jpg");
        }

        if (domain.indexOf(".joins.com") >= 0) {
            newsrc = src.replace(/\.tn_[0-9]*\..*/, "");
            if (newsrc !== src)
                return newsrc;
        }

        if (domain === "ir.joins.com") {
            // http://ir.joins.com/?u=http%3A%2F%2Fpds.joins.com%2F%2Fnews%2Fcomponent%2Fhtmlphoto_mmdata%2F201802%2F02%2Ff1272e1a-836b-4e54-be62-1ab42de3b53b.jpg
            //   http://pds.joins.com//news/component/htmlphoto_mmdata/201802/02/f1272e1a-836b-4e54-be62-1ab42de3b53b.jpg
            return decodeURIComponent(src.replace(/.*\/\?.*?u=([^&]*).*$/, "$1"));
        }

        if (domain.indexOf("uhd.img.topstarnews.net") >= 0) {
            return src.replace("/file_attach_thumb/", "/file_attach/").replace(/_[^/]*[0-9]*x[0-9]*_[^/]*(\.[^/]*)$/, "-org$1").replace(/(-[0-9]*)(\.[^/]*)$/, "$1-org$2");
        }

        if (domain === "www.topstarnews.net") {
            // http://www.topstarnews.net/news/thumbnail/201802/365216_8748_4653_v150.jpg
            //   http://www.topstarnews.net/news/photo/201802/365216_8748_4653_org.jpg
            // http://www.topstarnews.net/news/photo/201802/364365_7857_4310.jpg
            //   http://www.topstarnews.net/news/photo/201802/364365_7857_4310_org.jpg
            // http://www.topstarnews.net/news/thumbnail/first/201710/img_319718_1_v150.jpg
            //   http://www.topstarnews.net/news/photo/first/201710/img_319718_1_org.jpg
            //   http://cdn.topstarnews.net/news/photo/first/201710/img_319718_1_org.jpg
            return src
                .replace(/_v[0-9]+(\.[^/.]*)$/, "_org$1")
                .replace(/(_[0-9]+)(\.[^/.]*)$/, "$1_org$2")
                .replace("/thumbnail/", "/photo/");
        }

        if (domain.indexOf("thumb.mt.co.kr") >= 0 ||
            domain.indexOf("thumb.mtstarnews.com") >= 0) {
            // http://thumb.mt.co.kr/06/2017/12/2017122222438260548_1.jpg
            // 06 and 21 seem to be identical
            // after that, in order of size: 05, 07, 17, 11, 16, 10, 20, 04, 15, 03, 14, 19
            src = src.replace(/(thumb\.[^/]*)\/[0-9]+(\/[0-9]*\/[0-9]*\/[^/]*).*/, "$1/07$2");
        }

        if (domain === "menu.mt.co.kr") {
            // http://moneys.mt.co.kr/photoDb/mwPhotoDbList.php?no=2017013115555978429&page=1&idx=3
            //   http://menu.mt.co.kr/moneyweek/photoDb/2017/01/31/20170131155559784294333.jpg/dims/optimize
            //   http://menu.mt.co.kr/moneyweek/thumb/2017/01/31/06/2017013115108024857_1.jpg -- smaller
            //   http://menu.mt.co.kr/moneyweek/thumb/2017/01/31/00/2017013115108024857_1.jpg -- not found
            // http://menu.mt.co.kr/moneyweek/thumb/2018/03/05/19/2018030511008030850_1.jpg
            //   http://menu.mt.co.kr/moneyweek/thumb/2018/03/05/06/2018030511008030850_1.jpg
            //   http://menu.mt.co.kr/moneyweek/thumb/2018/03/05/00/2018030511008030850_1.jpg -- larger
            // http://menu.mt.co.kr/moneyweek/thumb/2017/11/16/00/2017111614558031796_1.jpg/dims/optimize/
            //   http://menu.mt.co.kr/moneyweek/thumb/2017/11/16/00/2017111614558031796_1.jpg
            //   http://menu.mt.co.kr/moneyweek/thumb/2017/11/16/06/2017111614558031796_1.jpg -- smaller
            // http://menu.mt.co.kr/moneyweek/thumb/2018/01/14/00/2018011416088035798_2.jpg/dims/optimize/
            // http://menu.mt.co.kr/moneyweek/thumb/2018/03/09/06/2018030917238012410_1.jpg (found on sidebar)
            //   http://menu.mt.co.kr/moneyweek/thumb/2018/03/09/00/2018030917238012410_1.jpg
            // http://menu.mt.co.kr/moneyweek/thumb/2017/06/24/06/2017062410078087905_1.jpg - larger than 00, but looks scaled

            // http://menu.mt.co.kr/moneyweek/thumb/2017/05/26/00/2017052617068063683_1.jpg -- works
            // http://menu.mt.co.kr/moneyweek/thumb/2017/05/23/00/2017052310108026652_1.jpg -- doesn't
            var obj = src.match(/\/thumb\/(?:[0-9]+\/){3}([0-9]+)\//);
            if (obj && obj[1] !== "00") {
                var obj1_str = src.replace(/.*\/thumb\/([0-9]+\/[0-9]+\/[0-9]+\/).*/, "$1").replace(/\//g, "");
                var obj1 = parseInt(obj1_str);
                console.log(obj1_str);
                if (obj1 >= 20170526)
                    src = src.replace(/(\/thumb\/(?:[0-9]+\/){3})[0-9]+\//, "$100/");
                else
                    src = src.replace(/(\/thumb\/(?:[0-9]+\/){3})[0-9]+\//, "$106/");
            }

            return src
                .replace(/\/dims\/.*/, "");
        }

        if (domain.indexOf("stardailynews.co.kr") >= 0 ||
            domain.indexOf("liveen.co.kr") >= 0 ||
            domain.indexOf("ilyoseoul.co.kr") >= 0 ||
            domain.indexOf("sportsq.co.kr") >= 0 ||
            domain.indexOf("zenithnews.com") >= 0 ||

            // doesn't work for all:
            // http://www.munhwanews.com/news/thumbnail/201801/106108_163361_2456_v150.jpg
            //   http://www.munhwanews.com/news/photo/201801/106108_163361_2456.jpg
            domain.indexOf("www.munhwanews.com") >= 0 ||
            // http://www.ccdailynews.com/news/thumbnail/201801/953374_384565_4611_v150.jpg
            domain === "www.ccdailynews.com" ||
            // http://ph.kyeonggi.com/news/thumbnail/201802/1440153_1332290_5913_150.jpg
            //   http://ph.kyeonggi.com/news/photo/201802/1440153_1332290_5913.jpg
            // http://ph.kyeonggi.com/edit/news/view_img/PHOTO_1440148_1332273_5348_47.jpg
            //   http://ph.kyeonggi.com/news/photo/201802/1440148_1332273_5348.jpg
            domain === "ph.kyeonggi.com" ||
            // http://www.jemin.com/news/thumbnail/201802/495551_158263_5710_v150.jpg
            domain === "www.jemin.com" ||
            // http://www.domin.co.kr/news/thumbnail/201802/1183690_311011_329_v150.jpg
            //   http://www.domin.co.kr/news/photo/201802/1183690_311011_329.jpg (very hq)
            // http://www.domin.co.kr/news/view_img/MAIN_2_2639_2152.jpg
            //   http://www.domin.co.kr/news/photo/201802/1183700_311009_2038.jpg
            domain === "www.domin.co.kr" ||
            // http://cdn.jejudomin.co.kr/news/thumbnail/201802/96102_90506_3656_v150.jpg
            // http://www.jejudomin.co.kr/photobox/photo/2018020261404454865.jpg
            //   http://cdn.jejudomin.co.kr/news/photo/201802/96119_90524_4043.jpg
            domain === "cdn.jejudomin.co.kr" ||
            // http://ph.incheonilbo.com/news/thumbnail/201712/792780_315340_1230_150.jpg
            domain === "ph.incheonilbo.com" ||
            // http://www.hidomin.com/news/thumbnail/201802/349870_151635_5018_v150.jpg
            domain === "www.hidomin.com" ||
            // http://www.newsfreezone.co.kr/news/thumbnail/201802/38623_37635_844_v150.jpg
            domain === "www.newsfreezone.co.kr" ||
            // http://www.newsinside.kr/news/thumbnail/201606/412819_220009_299_v150.jpg
            domain === "www.newsinside.kr" ||
            // http://cdn.newsfreezone.co.kr/news/thumbnail/201802/41850_39614_2056_v150.jpg
            domain === "cdn.newsfreezone.co.kr" ||
            // http://www.greenpostkorea.co.kr/news/thumbnail/201802/85004_79031_3615_v150.jpg
            domain === "www.greenpostkorea.co.kr" ||
            // http://www.egn.kr/news/thumbnail/201802/90010_149058_921_v150.jpg
            //
            // http://www.egn.kr/news/photo/201710/87447_142141_178.jpg
            // http://www.egn.kr/news/photo/201710/87447_142142_179.jpg
            // http://www.egn.kr/news/photo/201710/87447_142143_1710.jpg
            domain === "www.egn.kr" ||
            // http://www.whitepaper.co.kr/news/thumbnail/201802/95633_76403_5942_v150.jpg
            domain === "www.whitepaper.co.kr" ||
            // http://www.outdoornews.co.kr/news/thumbnail/201802/30078_79659_4819_v150.jpg
            domain === "www.outdoornews.co.kr" ||
            // http://www.shinailbo.co.kr/news/thumbnail/201803/1049737_358211_645_v150.jpg
            // http://www.shinailbo.co.kr/news/articleView.html?idxno=319278
            //   http://www.shinailbo.co.kr/news/photo/201304/319278_175094_5325.jpg - 3500x1807
            domain === "www.shinailbo.co.kr" ||
            // http://www.ngtv.tv/news/thumbnail/201803/44169_57237_2756_v150.jpg
            // http://www.ngtv.tv/news/articleView.html?idxno=24743
            //   http://www.ngtv.tv/news/thumbnail/201503/24743_28146_3449_v150.jpg
            //     http://www.ngtv.tv/news/photo/201503/24743_28146_3449.jpg - 2364x1971
            domain === "www.ngtv.tv" ||
            // http://www.rnx.kr/news/thumbnail/201803/62152_50525_470_150.jpg
            // http://m.rnx.kr/news/articleView.html?idxno=1390
            domain === "www.rnx.kr" ||
            // http://www.intronews.net/news/thumbnail/201803/85854_115174_717_v150.jpg
            // http://www.intronews.net/news/articleView.html?idxno=85633
            //   http://www.intronews.net/news/thumbnail/201802/85633_114974_1625_v150.jpg
            domain === "www.intronews.net" ||
            // http://www.newstown.co.kr/news/thumbnail/201801/311251_198441_4816_v150.jpg
            domain.indexOf("www.newstown.co.kr") >= 0) {
            return src
                .replace("/thumbnail/", "/photo/")
                .replace(/_v[0-9]*\.([^/]*)$/, ".$1")
                .replace(/(\/[0-9]+_[0-9]+_[0-9]+)_150(\.[^/.]*)$/, "$1$2");
        }

        if (domain.indexOf("newscj.com") >= 0) {
            return src.replace("/thumbnail/", "/photo/").replace(/_v[0-9]*\.[^./]*$/, ".JPG");
        }

        if (domain.indexOf("img.hankyung.com") >= 0) {
            return src.replace(/\.[0-9]\.([a-zA-Z0-9]*)$/, ".1.$1");
        }

        if (domain.indexOf("cdn.newsen.com") >= 0) {
            src = src.replace(/_ts\.[^/._]*$/, ".jpg").replace("/mphoto/", "/news_photo/");
            if (src.indexOf("/main_photo/") >= 0) {
                // http://cdn.newsen.com/newsen/main_photo/index_a2_201801030825321910_1.jpg
                // http://cdn.newsen.com/newsen/news_photo/2018/01/03/201801030825321910_1.jpg
                src = src.replace(/\/main_photo\/[^/]*_([0-9][0-9][0-9][0-9])([0-9][0-9])([0-9][0-9])([^/]*)$/, "/news_photo/$1/$2/$3/$1$2$3$4");
            }

            return src;
        }

        if (domain.indexOf("chosun.com") >= 0 ||
            domain.indexOf("chosunonline.com") >= 0) {
            // works:
            // http://woman.chosun.com/up_fd/wc_news/2018-01/simg_thumb/1802_292s.jpg
            //   http://woman.chosun.com/up_fd/wc_news/2018-01/simg_org/1802_292s.jpg
            //   http://woman.chosun.com/up_fd/wc_news/2018-01/bimg_org/1802_292.jpg
            // http://woman.chosun.com/up_fd/wc_news/2018-01/simg_org/1802_294s.jpg
            //   http://woman.chosun.com/up_fd/wc_news/2018-01/bimg_org/1802_294.jpg
            // http://woman.chosun.com/up_fd/wc_news/2018-02/simg_org/1802_88s.jpg
            //   http://woman.chosun.com/up_fd/wc_news/2018-02/bimg_org/1802_88.jpg
            // http://woman.chosun.com/up_fd/wc_news/2018-02/simg_org/1802_340s.jpg
            //   http://woman.chosun.com/up_fd/wc_news/2018-02/bimg_org/1802_340.jpg
            // http://woman.chosun.com/up_fd/wc_news/2018-01/simg_org/1802_294s.jpg
            //   http://woman.chosun.com/up_fd/wc_news/2018-01/bimg_org/1802_294.jpg
            // http://woman.chosun.com/up_fd/wc_news/2018-02/simg_org/1802_322s.jpg
            //   http://woman.chosun.com/up_fd/wc_news/2018-02/bimg_org/1802_322.jpg
            // http://ekr.chosunonline.com/site/data/thumb_dir/2018/02/23/2018022301051_1_thumb.jpg
            //   http://ekr.chosunonline.com/site/data/img_dir/2018/02/23/2018022301051_1.jpg
            // http://ekr.chosunonline.com/site/data/thumb_dir/2018/02/21/2018022101757_3_thumb.jpg
            //   http://ekr.chosunonline.com/site/data/img_dir/2018/02/21/2018022101757_3.jpg
            // http://sccdn.chosun.com/news/photobook/201504/13267_scr_201504140000000022741_t.jpg
            //   http://sccdn.chosun.com/news/photobook/201504/13267_201504140000000022741.jpg
            // http://sccdn.chosun.com/news/photobook/201504/13267_2015041400000000000122741_t.jpg
            //   http://sccdn.chosun.com/news/photobook/201504/13267_2015041400000000000122741.jpg
            // http://sccdn.chosun.com/news/photobook/201203/4488_scr_%EB%8D%9C%EB%8D%9C_t.jpg
            //
            // doesn't work:
            // http://woman.chosun.com/up_fd/wc_news/2018-01/simg_org/1801_164s.jpg
            // http://ekr.chosunonline.com/site/data/img_dir/2015/07/16/2015071601601_thumb.jpg
            // large:
            // http://sccdn.chosun.com/news/photobook/201710/23202_2017101301010007001.jpeg
            // http://sccdn.chosun.com/news/photobook/201412/11896_20141201010101000972.jpeg
            // http://sccdn.chosun.com/news/photobook/201607/18084_207777778888816070401010002381.jpeg
            // http://sccdn.chosun.com/news/photobook/201412/11896_2014120101000156100006731.jpg - small
            // http://sccdn.chosun.com/news/photobook/201412/11896_2014120101000155800006701.jpg - ^

            if (domain === "sccdn.chosun.com") {
                return src.replace(/\/([0-9]*_)(?:scr_)?([^._/]*)(?:_t)?(\.[^/.]*)$/, "/$1$2$3");
            }

            return src
                //.replace(/\/simg_(?:thumb|org)\/([^/]*)s(\.[^/.]*)$/, "/bimg_org/$1$2")
                .replace("/simg_thumb/", "/simg_org/")
                .replace(/\/thumb_dir\/(.*)_thumb(\.[^/.]*)$/, "/img_dir/$1$2")
                // http://image.chosun.com/sitedata/thumbnail/201803/08/2018030801755_0_thumb.jpg
                //   http://image.chosun.com/sitedata/image/201803/08/2018030801755_0.jpg
                .replace(/\/thumbnail\/(.*?)(?:_thumb)?(\.[^/.]*)$/, "/image/$1$2");
        }

        if (domain.indexOf("ph.spotvnews.co.kr") >= 0) {
            return src.replace("/thumbnail/", "/photo/").replace(/([0-9]+_[0-9]+_[0-9]+)_[0-9]+\.([^/]*)$/, "$1.$2");
        }

        if (domain.indexOf("photo.hankooki.com") >= 0) {
            // http://photo.hankooki.com/newsphoto/v001/thumbs/2017/06/23/tsjmao20170623113309_O_00_C_1.jpg
            // http://photo.hankooki.com/newsphoto/v001/2017/06/23/sjmao20170623113309_O_00_C_1.jpg

            // http://photo.hankooki.com/arch/thumbs/P/2017/10/25/t20171025182853_P_00_C_1_846.jpg
            // http://photo.hankooki.com/arch/photo/P/2017/10/25/20171025182853_P_00_C_1_846.jpg
            // http://photo.hankooki.com/arch/original/P/2017/10/25/20171025182853_P_00_C_1_846.jpg

            // http://photo.hankooki.com/newsphoto/yonhap/thumbs/2016/05/17/t_20160517121834.jpg
            // http://photo.hankooki.com/newsphoto/yonhap/2016/05/17/20160517121834.jpg

            // http://photo.hankooki.com/newsphoto/v001/thumbs/2018/01/28/20180128000108_1_holic.jpg -- doesn't work
            //   http://photo.hankooki.com/newsphoto/v001/2018/01/27/jay1220180127233802_P_02_C_1.jpg (unrelated url?)

            // http://photo.hankooki.com/newsphoto/v001/thumbs/2014/11/11/tegeriace20141111172610_X_01_C_1.jpg -- doesn't work, tries to go to:
            //   http://photo.hankooki.com/newsphoto/v001/2014/11/11/egeriace20141111172610_X_01_C_1.jpg
            // real:
            //   http://photo.hankooki.com/newsphoto/v001/2014/11/11/wegeriace20141111172610_X_01_C_1.jpg
            newsrc =
                src.replace("/arch/photo/", "/arch/original/")
                   .replace("/arch/thumbs/", "/arch/original/")
                   .replace(/(\/newsphoto\/[^/]*\/)thumbs\//, "$1");//.replace(/(.*\/)t([0-9]*[^/]*)$/, "$1$2");
            if (newsrc !== src) {
                return newsrc.replace(/(.*\/)t_?([^/]*)$/, "$1$2");
            } else {
                return src;
            }
        }

        if (domain.indexOf(".ettoday.net") >= 0) {
            return src.replace(/\/[a-z]*([0-9]*\.[^/]*)$/, "/$1");
        }

        if (domain.indexOf("img.mbn.co.kr") >= 0) {
            // http://img.mbn.co.kr/filewww/news/other/2012/04/30/340200121110.jpg - 5705x2917
            return src.replace(/_s[0-9]+x[0-9]+(\.[^/]*)$/, "$1");
        }

        if (domain.search(/image[0-9]*\.inews24\.com/) >= 0) {
            return src.replace("/thumbnail/", "/");
        }

        if (src.indexOf(".wowkorea.jp/img") >= 0) {
            // works:
            // http://kt.wowkorea.jp/img/album/10/54888/94580_l.jpg
            //   http://kt.wowkorea.jp/img/album/10/54888/94580.jpg
            // doesn't work:
            // http://kt.wowkorea.jp/img/news/3/19899/53692_s.jpg
            //   http://kt.wowkorea.jp/img/news/3/19899/53692_l.jpg - works
            //   http://kt.wowkorea.jp/img/news/3/19899/53692.jpg - 404
            // http://kt.wowkorea.jp/img/news/3/19961/53856_160.jpg
            if (src.indexOf("/img/album/") < 0)
                return src.replace(/([^/]*_)[a-z0-9]*(\.[^/.]*)$/, "$1l$2");
            return src.replace(/([^/]*)_[a-z0-9]*(\.[^/.]*)$/, "$1$2");
        }

        if (domain.indexOf("img.saostar.vn") >= 0) {
            // https://img.saostar.vn/fb660png_1/2017/11/04/1750083/img_0127.jpg/fbsscover.png
            return src
                .replace(/saostar.vn\/fb[0-9]+[^/]*(\/.*\.[^/.]*)\/[^/]*$/, "saostar.vn$1")
                .replace(/saostar.vn\/[a-z][0-9]+\//, "saostar.vn/")
                .replace(/saostar.vn\/[0-9]+x[0-9]+\//, "saostar.vn/");
        }

        if (src.match(/\/www.google.[a-z]*\/url\?/)) {
            return decodeURIComponent(src.replace(/.*url=([^&]*).*/, "$1"));
        }

        if ((domain.indexOf("www.lipstickalley.com") >= 0 ||
             domain.indexOf("forum.purseblog.com") >= 0) &&
            src.indexOf("/proxy.php?") >= 0) {
            return decodeURIComponent(src.replace(/.*image=([^&]*).*/, "$1"));
        }

        if (src.indexOf("nosdn.127.net/img/") >= 0) { //lofter
            return src.replace(/\?[^/]*$/, "");//"?imageView");
        }

        if (domain.indexOf("board.makeshop.co.kr") >= 0) {
            return src.replace(/\/[a-z]*::/, "/");
        }

        if (src.match(/rr.img[0-9]*.naver.jp\/mig/)) {
            // https://rr.img1.naver.jp/mig?src=http%3A%2F%2Fimgcc.naver.jp%2Fkaze%2Fmission%2FUSER%2F20161018%2F76%2F7776016%2F17%2F600x450x28290423f03522c4ff136cd5.jpg&twidth=414&theight=0&qlt=80&res_format=jpg&op=r
            return decodeURIComponent(src.replace(/.*src=([^&]*).*/, "$1"));
        }

        if (domain.indexOf("imgcc.naver.jp") >= 0) {
            return src.replace(/\/[0-9]+\/[0-9]+\/*$/, "");
        }

        if (domain.indexOf("dimg.donga.com") >= 0) {
            return src.replace(/\/i\/[0-9]+\/[0-9]+\/[0-9]+\//, "/");
        }

        if (domain.match(/s[0-9]\.marishe\.com/)) {
            return src.replace(/(\/[^/]*)_[0-9]+(\.[^/.]*)$/, "$1$2");
        }

        // img77
        if (domain.match(/img[0-9]*\.dreamwiz\.com/)) {
            return src.replace(/(\/[^/]*)_[a-z]\.([^/.]*)$/, "$1_o.$2");
        }

        if (domain.indexOf("cdn.hk01.com") >= 0) {
            return src.replace(/(\/media\/images\/[^/]*\/)[^/]*\//, "$1xxlarge/");
        }

        if (domain.indexOf(".sinaimg.cn") >= 0) {
            // works:
            // http://ss12.sinaimg.cn/orignal/66a6ce75g8b46ba3a373b&690
            // http://ss12.sinaimg.cn/orignal/6bc10695g923b8902976b&690
            // http://ss7.sinaimg.cn/orignal/67a7cd73g8b48c289ae26&690
            // http://ss6.sinaimg.cn/orignal/6b3178f4g92678953d725&690
            // doesn't:
            // http://ww4.sinaimg.cn/large/ad769c8bgy1fnaovhjp4rj21m62iob2d.jpg
            //   http://ww4.sinaimg.cn/woriginal/ad769c8bgy1fnaovhjp4rj21m62iob2d.jpg - works
            // http://wx3.sinaimg.cn/large/71080fe4gy1fehxmeusddj21kw2ddb2a.jpg
            // https://wxt.sinaimg.cn/large/006Qyga5ly1fnsl8inznlj31ww2pgqv8.jpg
            //
            // http://k.sinaimg.cn/n/ent/transform/w150h100/20180227/Mf6R-fyrwsqi6927544.jpg/w150h100f1t0l0syf.png
            //   http://n.sinaimg.cn/sinacn/w603h580/20180227/b993-fyrwsqi5950343.jpg
            // http://n.sinaimg.cn/ent/transform/w500h750/20180206/FzeL-fyrhcqz0888399.jpg
            //   http://k.sinaimg.cn/ent/transform/w500h750/20180206/FzeL-fyrhcqz0888399.jpg - doesn't work (bad request)
            //   http://n.sinaimg.cn/sinacn/w500h750/20180206/FzeL-fyrhcqz0888399.jpg - doesn't work
            //
            // http://n.sinaimg.cn/translate/w750h484/20180206/c8U1-fyrhcqy9899138.jpg
            //   http://n.sinaimg.cn/transform/w750h484/20180206/c8U1-fyrhcqy9899138.jpg - doesn't work
            //
            // http://n.sinaimg.cn/translate/20170819/QwU0-fykcpru8486163.jpg
            //
            // http://n.sinaimg.cn/ent/4_ori/upload/a57892fc/w2048h3072/20180217/zPxq-fyrpeif2120125.jpg
            if (domain.match(/^ss/)) {
                src = src.replace(/\.sinaimg\.cn\/[^/]*\/([^/]*)\/*$/, ".sinaimg.cn/orignal/$1");
            } else {
                src = src.replace(/\.sinaimg\.cn\/[^/]*\/([^/]*)\/*$/, ".sinaimg.cn/large/$1");
            }
            return src.replace(/\/slidenews\/([^/_]*)_[^/_]*\//, "/slidenews/$1_img/"); // there's also _ori, but it seems to be smaller?
        }

        if (domain.indexOf("thumbnail.egloos.net") >= 0) {
            return src.replace(/.*:\/\/thumbnail\.egloos\.net\/[^/]*\/*/, "");
        }

        if (domain.indexOf("k.kakaocdn.net") >= 0) {
            return src.replace(/\/img_[a-z]*\.([^./]*)$/, "/img.$1");
        }

        if (domain.indexOf("images.sportskhan.net") >= 0 ||
            domain == "img.khan.co.kr") {
            return src
                .replace(/\/r\/[0-9]+x[0-9]+\//, "/")
                .replace(/\/[a-z]*_([0-9]+\.[a-z0-9A-Z]*)$/, "/$1")
                .replace(/\/c\/[0-9]*x[0-9]*\//, "/")
                .replace(/\/photodb\//, "/PhotoDB/");
        }

        if (domain === "img.sbs.co.kr") {
            // http://img.sbs.co.kr/sbscnbc/upload/2017/11/06/10000590366_700.jpg
            //   http://img.sbs.co.kr/sbscnbc/upload/2017/11/06/10000590366.jpg
            return src.replace(/(\/[0-9]+)_[0-9]+\.([a-z0-9A-Z]*)$/, "$1.$2");
        }

        if (domain.match(/img[0-9]\.sbs\.co\.kr/)) {
            // http://img2.sbs.co.kr/img/sbs_cms/SR/2017/06/26/SR88942637_w640_h360.jpg
            return src.replace(/(\/[^_]*)_[^/.]*(\.[^/.]*)$/, "$1_ori$2");
        }

        if (domain === "image.board.sbs.co.kr") {
            // http://image.board.sbs.co.kr/2018/02/02/h191517549706907-600.jpg
            //   http://image.board.sbs.co.kr/2018/02/02/h191517549706907.jpg
            return src.replace(/-[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf("image.edaily.co.kr") >= 0) {
            // http://spnimage.edaily.co.kr/images/Photo/files/NP/S/2018/02/PS18021400011h.jpg
            // http://image.edaily.co.kr/images/Photo/files/NP/S/2018/02/PS18021100248t.jpg
            // (none, g), b, t, h, s, m
            // others:
            // http://www.edaily.co.kr/news/news_detail.asp?newsId=01203766619110520&mediaCodeNo=257
            //  http://image.edaily.co.kr/images/photo/files/NP/S/2018/02/PS18021400103.jpg (original?)
            //  http://image.edaily.co.kr/images/photo/files/HN/H/2018/02/HNE01203766619110520_LV1.jpg - zoomed in
            //  http://image.edaily.co.kr/images/photo/files/HN/H/2018/02/HNE01203766619110520.jpg - not zoomed in, but cropped
            return src.replace(/(\/[A-Z0-9]+)[a-z]\.([a-z0-9A-Z]*)$/, "$1.$2");
        }

        // cloudinary
        // /master/master/ is another possible alternative
        if (domain.indexOf("media.glamour.com") >= 0 ||
            domain.indexOf("assets.teenvogue.com") >= 0 ||
            domain.indexOf("assets.vogue.com") >= 0 ||
            domain.indexOf("media.vanityfair.com") >= 0 ||
            domain.indexOf("media.gq.com") >= 0 ||
            domain.indexOf("media.wmagazine.com") >= 0 ||
            domain.indexOf("media.self.com") >= 0 ||
            domain.indexOf("media.pitchfork.com") >= 0 ||
            domain.indexOf("media.wired.com") >= 0 ||
            // https://media.golfdigest.com/photos/5a7498e5b9a33161e3689aa9/master/w_780,c_limit/180202-sb-party.jpg
            domain === "media.golfdigest.com" ||
            // https://media.architecturaldigest.com/photos/56380571a6f997a353b888a2/master/w_640,c_limit/worlds-best-stained-glass-windows-13-10.jpg
            domain === "media.architecturaldigest.com" ||
            // https://media.cntraveler.com/photos/59bb6a56e35d8f08044a32cf/16:9/pass/Rakotzbrucke-GettyImages-538162756.jpg
            // http://media.cntraveler.com/photos/59305e5611e6e853c33e7587/master/w_1440,c_limit/car-free-halibut-cove-alaska-GettyImages-496660709.jpg
            domain === "media.cntraveler.com" ||
            domain.indexOf("media.allure.com") >= 0 ||
            src.match(/:\/\/[^/]*\/photos\/[0-9a-f]{24}\/[^/]*\/[^/]*\/[^/]*$/)) {
            return src.replace(/\/[^/]*\/[^/]*\/([^/]*)$/, "/original/original/$1");
        }

        if (domain.indexOf(".cloudinary.com") >= 0 ||
            domain === "images.taboola.com") {
            // https://res.cloudinary.com/emazecom/image/fetch/c_limit,a_ignore,w_320,h_200/https%3A%2F%2Fimg-aws.ehowcdn.com%2F877x500p%2Fs3.amazonaws.com%2Fcme_public_images%2Fwww_ehow_com%2Fi.ehow.com%2Fimages%2Fa04%2Fbd%2Fic%2Fchemical-energy-work-3.1-800x800.jpg
            // https://images.taboola.com/taboola/image/fetch/f_jpg%2Cq_auto%2Cc_fill%2Cg_faces:auto%2Ce_sharpen/https%3A%2F%2Fwww.gannett-cdn.com%2F-mm-%2F2e56892f6a349ad47192b530425d443fb365e5e9%2Fr%3Dx1803%26c%3D3200x1800%2Fhttps%2Fmedia.gannett-cdn.com%2F37861007001%2F37861007001_5735420050001_5735409691001-vs.jpg%3FpubId%3D37861007001
            // https://res.cloudinary.com/emazecom/image/fetch/c_limit,a_ignore,w_320,h_200/http%3A%2F%2Fcdn.expansion.mx%2Fdims4%2Fdefault%2F5227468%2F2147483647%2Fthumbnail%2F850x478%255E%2Fquality%2F75%2F%3Furl%3Dhttps%253A%252F%252Fcdn.expansion.mx%252Fmedia%252F2010%252F06%252F08%252Fobreros-chinos-trabajadores-china.jpg
            if (src.search(/:\/\/[^/]*\/[^/]*\/image\/fetch\//) >= 0) {
                newsrc = src.replace(/.*?:\/\/[^/]*\/[^/]*\/image\/fetch\/(?:.*?\/)?([^/]*(?::|%3A).*)/, "$1");
                if (newsrc.match(/^[^/:]*%3A/))
                    newsrc = decodeURIComponent(newsrc);
                return newsrc;
            }

            newsrc = src.replace(/(\/iu\/[^/]*)\/.*?(\/v[0-9]*)/, "$1$2");
            if (newsrc !== src)
                return newsrc;
        }

        // https://res.cloudinary.com/beamly/image/upload/s--Ayyiome3--/c_fill,g_face,q_70,w_479/f_jpg/v1/news/sites/6/2014/11/Nick-Hewer-The-Apprentice.jpg
        //   https://res.cloudinary.com/beamly/image/upload/v1/news/sites/6/2014/11/Nick-Hewer-The-Apprentice.jpg
        // https://res.cloudinary.com/beamly/image/upload/s--pMOefc2U--/c_fill,g_face,q_70,w_1160/f_jpg/v1/news/sites/6/2014/05/LuisaSwimsuit621.jpg
        //   https://res.cloudinary.com/beamly/image/upload/v1/news/sites/6/2014/05/LuisaSwimsuit621.jpg
        // https://res.cloudinary.com/beamly/image/upload/s--1uSHUtr1--/c_fill,g_face,q_70,w_1160/f_jpg/v1/news/sites/6/2013/12/o-katie-hopkins-570.jpg
        //   https://res.cloudinary.com/beamly/image/upload/v1/news/sites/6/2013/12/o-katie-hopkins-570.jpg
        // http://thefader-res.cloudinary.com/private_images/w_1440,c_limit,f_auto,q_auto:best/Badgyal5RGB_wbgyon/bad-gyal-nicest-cocky-interview-dancehall-catalan.jpg
        //   http://thefader-res.cloudinary.com/private_images/c_limit/Badgyal5RGB_wbgyon/bad-gyal-nicest-cocky-interview-dancehall-catalan.jpg
        // https://res.cloudinary.com/dk-find-out/image/upload/q_80,w_1920,f_auto/MA_00079563_yvu84f.jpg
        // https://res.cloudinary.com/jerrick/image/upload/p7jbqvi0aoxm4mdn3x6x
        if (domain.indexOf("res.cloudinary.com") >= 0) {
            return src
                .replace(/(\/image\/upload\/)(?:(?:.*?\/?(v1\/))|(?:[^/]*\/))/, "$1$2")
                .replace(/(\/private_images\/)[^/]*\//, "$1c_limit/");
        }

        if (domain.indexOf("images.complex.com") >= 0) {
            // https://images.complex.com/complex/images/c_crop,h_2437,w_3289,x_0,y_1067/c_limit,w_680/fl_lossy,pg_1,q_auto/gc123hobhudxx063ak8v/converse-yung-lean-one-star
            //   https://images.complex.com/complex/images/gc123hobhudxx063ak8v/converse-yung-lean-one-star
            // https://images.complex.com/complex/image/upload/c_limit,w_680/fl_lossy,pg_1,q_auto/qh1ve8ncxzxlfiy9aauw.jpg
            //   https://images.complex.com/complex/image/upload/qh1ve8ncxzxlfiy9aauw.jpg
            // https://images.complex.com/complex/images/c_scale,w_1100/fl_lossy,pg_1,q_auto/blwjl76jv2vcqdgd3sqy/bella-thorne
            //   https://images.complex.com/complex/images/blwjl76jv2vcqdgd3sqy/bella-thorne
            // http://images.complex.com/complex/image/upload/t_article_image/ckxhi0lpw2jsvm3rx3f4.jpg
            //   http://images.complex.com/complex/image/upload/ckxhi0lpw2jsvm3rx3f4.jpg
            // https://images.complex.com/complex/images/c_scale,w_1100/fl_lossy,pg_1,q_auto/brfqstj5jihhzr9eu1bw/bella-thorne
            //   https://images.complex.com/complex/images/brfqstj5jihhzr9eu1bw/bella-thorne
            return src.replace(/\/(images|image\/upload)\/[^/]*_[^/]*\//, "/$1/");
        }

        if (// https://images.spot.im/image/upload/q_70,fl_lossy,dpr_1.0,h_300,w_320,c_fill,g_face/v200/production/watfc8itl4hcgavprfku
            //   https://images.spot.im/image/upload/production/watfc8itl4hcgavprfku
            domain === "images.spot.im" ||
            // https://fashionista.com/.image/ar_16:9%2Cc_fill%2Ccs_srgb%2Cg_faces:center%2Cq_80%2Cw_620/MTQyNjI1MjYyNTc4NzA1NzM0/emma-watson-promojpg.jpg
            // https://fashionista.com/.image/t_share/MTQ2Njg0NzA2NzUzMDk1NTQ3/gettyimages-672499332.jpg
            domain === "fashionista.com" ||
            // http://images.pigeonsandplanes.com/images/c_crop,h_2268,w_3024,x_0,y_330/c_limit,f_auto,fl_lossy,q_auto,w_1030/obk4degjo35h2jzuwyd7/opal-press-2017
            domain === "images.pigeonsandplanes.com" ||
            // https://images.sftcdn.net/images/t_optimized,f_auto/p/2fbcf826-96d0-11e6-ac58-00163ec9f5fa/62785002/gang-beasts-screenshot.jpg
            domain === "images.sftcdn.net" ||
            // http://cdn.primedia.co.za/primedia-broadcasting/image/upload/c_fill,h_289,q_70,w_463/o0nu1bpsbgpfgvwa7vmj
            domain === "cdn.primedia.co.za" ||
            // https://www.maxim.com/.image/c_limit%2Ccs_srgb%2Cq_80%2Cw_960/MTUzMzQ0MzA2MTQzNTAzNzUz/harley-davidson-livewire3.webp
            domain === "www.maxim.com" ||
            // https://img.thedailybeast.com/image/upload/c_crop,d_placeholder_euli9k,h_1439,w_2560,x_0,y_0/dpr_2.0/c_limit,w_740/fl_lossy,q_auto/v1492195023/articles/2014/10/19/the-world-s-most-beautiful-boat-yours-for-half-a-billion-dollars/141018-teeman-star-yacht-tease_tlw0nl
            domain === "img.thedailybeast.com" ||
            // https://alibaba.kumpar.com/kumpar/image/upload/h_153,w_273,c_fill,ar_16:9,g_face,f_jpg,q_auto,fl_progressive,fl_lossy/hzwutxv6kqhrj3grgbtf.jpg
            domain === "alibaba.kumpar.com" ||
            // https://5b0988e595225.cdn.sohucs.com/q_70,c_zoom,w_640/images/20180121/1fad12f07c90464295f05598305a08ad.jpeg
            domain === "5b0988e595225.cdn.sohucs.com" ||
            // nano defender blocks this?
            // https://images-cdn.moviepilot.com/images/c_fill,h_1800,w_2897/t_mp_quality/vg7z3yhfbklgnnlki3cs/angelina-jolie-s-next-project-is-close-to-her-heart-and-her-son-maddox-will-be-involved-530390.jpg
            domain === "images-cdn.moviepilot.com" ||
            // https://images.moviepilot.com/images/c_limit,q_auto:good,w_600/uom2udz4ogmkncouu83q/beauty-and-the-beast-credit-disney.jpg
            // https://images.moviepilot.com/image/upload/c_fill,h_64,q_auto,w_64/lpgwdrrgc3m8duvg7zt2.jpg
            domain === "images.moviepilot.com") {
            return src
                .replace(/%2C/g, ",")
                .replace(/\/[a-z]+_[^/_,]+(?:,[^/]*)?\//, "/")
                .replace("/t_mp_quality/", "/")
                .replace(/\/v[0-9]+\//, "/");
        }

        // https://image.kkday.com/image/get/w_1900%2Cc_fit/s1.kkday.com/product_17911/20170926035641_Kii80/jpg
        //   https://image.kkday.com/image/get/s1.kkday.com/product_17911/20170926035641_Kii80/jpg
        if (domain === "image.kkday.com") {
            return src.replace(/\/image\/get\/[^/]*(?:%2C|,)[^/]*\//, "/image/get/");
        }

        if (domain.indexOf("images.fastcompany.net") >= 0 ||
            domain.indexOf("i.kinja-img.com") >= 0 ||
            domain.indexOf("dwgyu36up6iuz.cloudfront.net") >= 0
           ) {
            return src.replace(/\/image\/upload\/[^/]*[_-][^/]*\//, "/image/upload/");
        }

        if (domain.indexOf("cdn.skim.gs") >= 0) {
            // http://cdn.skim.gs/image/upload/c_fill,dpr_1.0,f_auto,fl_lossy,q_auto,w_940/v1456338060/msi/fc8_k4lgbp.jpg
            return src
                .replace(/\/image\/upload\/[^/]*_[^/]*\//, "/image/upload/")
                .replace(/\/images\/[^/]*_[^/]*\//, "/images/");
        }

        if ((domain.indexOf("biography.com") >= 0 ||
             domain === "www.guitarworld.com" ||
             domain === "www.guitaraficionado.com" ||
             domain === "www.psneurope.com") &&
            src.indexOf("/.image/") >= 0 ||
            src.match(/:\/\/[^/]*\/\.image\/[^/]*_[^/]*\/[A-Za-z-0-9]{24}\/[^/]*$/)) {
            // https://www.biography.com/.image/c_limit%2Ccs_srgb%2Cq_80%2Cw_960/MTI2NDQwNDA2NTg5MTUwNDgy/ariana-grande-shutterstock_213445195-600x487jpg.webp
            // https://www.guitarworld.com/.image/t_share/MTUxNDQ0NTk1MTMyMDgxNDA3/keithrichardsgettyimages-71684054.jpg
            //   https://www.guitarworld.com/.image//MTUxNDQ0NTk1MTMyMDgxNDA3/keithrichardsgettyimages-71684054.jpg
            // https://www.guitarworld.com/.image/ar_8:10%2Cc_fill%2Ccs_srgb%2Cg_faces:center%2Cq_80%2Cw_620/MTUwNjEyNDY4MDM2MzQ3MjU2/keith_richards_2jpg.jpg
            //   https://www.guitarworld.com/.image//MTUwNjEyNDY4MDM2MzQ3MjU2/keith_richards_2jpg.jpg
            // https://www.psneurope.com/.image/c_limit%2Ccs_srgb%2Cq_80%2Cw_482/MTUwNjU0MjczNjQ2NjM0NjU3/vintage-studios-web.webp
            //   https://www.psneurope.com/.image/MTUwNjU0MjczNjQ2NjM0NjU3/vintage-studios-web.webp
            return src.replace(/(\/.image)\/[^/]*(\/[^/]*\/[^/]*)$/, "$1$2");
        }

        if (domain.indexOf(".vogue.de") >= 0 &&
            src.indexOf("/storage/images/") >= 0) {
            // http://m.vogue.de/var/vogue/storage/images/home/vogue/fashion-shows/kollektionen/fruehjahr-2017-hc/paris/alexandre-vauthier/runway/_arc0726/23291608-1-ger-DE/_arc0726_v540x910.jpg
            return src.replace(/_v[0-9]*x[0-9]*\.([^/]*)$/, ".$1");
        }

        if (domain.indexOf(".popsugar-assets.com") >= 0) {
            // http://media3.popsugar-assets.com/files/2013/09/16/795/n/1922564/b962955383f6b80f_1592163256t6a65.xxxlarge_2x/i/Emma-Watson-all-legs-sexy-Peter-Pilotto-cutout-minidress.jpg
            // https://media1.popsugar-assets.com/files/thumbor/Aq5Tn8-7kqPSJs4U0_QaYoM6x8Q/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2015/03/30/647/n/1922564/ccc1eafd_edit_img_cover_file_864129_1397566805/i/Emma-Watson-Best-Red-Carpet-Looks.png
            //   https://media1.popsugar-assets.com/files/2015/03/30/647/n/1922564/ccc1eafd_edit_img_cover_file_864129_1397566805/i/Emma-Watson-Best-Red-Carpet-Looks.png
            // https://media1.popsugar-assets.com/files/thumbor/1ktKvFdaPtIVjrL085ZgDu-0IUM/160x160/filters:format_auto-!!-:strip_icc-!!-:sharpen-!1,0,true!-/2014/04/09/959/n/1922564/d006b9f456c00f56_478466321_10/i/Emma-Watson-Wes-Gordon-2014-Noah-Germany-Premiere.jpg
            //   https://media1.popsugar-assets.com/files/2014/04/09/959/n/1922564/d006b9f456c00f56_478466321_10/i/Emma-Watson-Wes-Gordon-2014-Noah-Germany-Premiere.jpg
            return src.replace(/\/thumbor\/[^/]*\/(?:fit-in\/)?[^/]*\/filters:[^/]*\//, "/");
        }

        if (domain === "elleuk.cdnds.net") {
            // http://elleuk.cdnds.net/15/37/980x1306/980x1306--29f8-11e6-9cdd-21395b3400d9-assets-elleuk-com-gallery-16644-1365760633-emma-watson-january-2013-jpg.jpg
            //   http://assets.elleuk.com/gallery/16644/1365760633-emma-watson-january-2013.jpg
            //
            // http://elleuk.cdnds.net/15/37/768x1024/768x1024-d38b1ahttp-s3-eu-west-1-amazonaws-com-ee-elleuk-2-emma-watson-december-2014-cover-star-composite-jpg.jpg
            // http://s3-eu-west-1.amazonaws.com/ee-elleuk/Hailey-Baldwin-Topshop-unique-RS15-0515-Imaxtree.jpg
            // problem: capitalized
            newsrc = src.replace(/:\/\/.*\/[^/]*assets-elleuk-com-gallery-([0-9]*)-([^/]*)-([^-/.]*)\.[^-/.]*$/, "://assets.elleuk.com/gallery/$1/$2.$3");
            if (newsrc !== src)
                return newsrc;
        }

        if (domain.indexOf(".cdnds.net") >= 0 &&
            !src.match(/\/gallery_[^/]*$/) &&
            !src.match(/\/[0-9]*x[0-9]*-[^/]*$/)) {
            //domain.indexOf("esquireuk.cdnds.net") < 0 &&
            //domain.indexOf("digitalspyuk.cdnds.net") < 0

            // doesn't work:
            // http://digitalspyuk.cdnds.net/14/42/768x512/gallery_7065877-low_res-.jpg
            //   http://digitalspyuk.cdnds.net/14/42/1600x1067/gallery_7065877-low_res-.jpg
            // http://digitalspyuk.cdnds.net/11/51/768x512/gallery_tv_countdown_nick_hewer_2.jpg
            //   http://digitalspyuk.cdnds.net/11/51/gallery_tv_countdown_nick_hewer_2.jpg
            // http://digitalspyuk.cdnds.net/13/40/980x1470/gallery_emma-watson.jpg
            //
            // works:
            // http://digitalspyuk.cdnds.net/16/47/980x490/landscape-1479890677-gettyimages-108378197.jpg
            //   http://digitalspyuk.cdnds.net/16/47/landscape-1479890677-gettyimages-108378197.jpg
            // http://elleuk.cdnds.net/17/06/1600x900/hd-aspect-1486581368-emma-web.jpg
            //   http://elleuk.cdnds.net/17/06/hd-aspect-1486581368-emma-web.jpg
            // http://cosmouk.cdnds.net/14/51/980x490/nrm_1418985628-nick-hewer-quits-apprentice.jpg?resize=768:*
            //   http://cosmouk.cdnds.net/14/51/nrm_1418985628-nick-hewer-quits-apprentice.jpg?resize=768:*
            // http://elleuk.cdnds.net/17/25/480x719/gallery-1498212018-emmawatsonlouisvuitton.jpg
            //   http://elleuk.cdnds.net/17/25/gallery-1498212018-emmawatsonlouisvuitton.jpg
            return src.replace(/\/[0-9]+x[0-9]+\//, "/").replace(/(\/[^/]*)\?[^/]*$/, "$1");
        }

        if (domain.indexOf("img.usmagazine.com") >= 0) {
            return src.replace(/(.*?[^:])\/[0-9]*-[^/]*\//, "$1/");
        }

        if (domain.indexOf("gannett-cdn.com") >= 0 &&
            src.indexOf("/-mm-/") >= 0) {
            // https://www.gannett-cdn.com/-mm-/2e56892f6a349ad47192b530425d443fb365e5e9/r=x1803&c=3200x1800/https/media.gannett-cdn.com/35547429001/35547429001_5727574988001_5727573873001-vs.jpg?pubId=35547429001
            //   https://media.gannett-cdn.com/35547429001/35547429001_5727574988001_5727573873001-vs.jpg
            // https://www.gannett-cdn.com/-mm-/2eab0172f87f63087b9b90322b67744820df1d8d/c=0-230-4565-2809&r=x1683&c=3200x1680/local/-/media/2018/02/27/USATODAY/USATODAY/636553489293713705-AFP-AFP-10H1QY-97704432.JPG
            //   https://www.gannett-cdn.com/media/2018/02/27/USATODAY/USATODAY/636553489293713705-AFP-AFP-10H1QY-97704432.JPG
            newsrc = src.replace(/.*?\/-mm-\/[0-9a-f]*\/[^/]*\/(http[^/]*)\/(.*)$/, "$1://$2");
            if (newsrc !== src)
                return newsrc;

            return src.replace(/\/-mm-\/.*?\/-\//, "/");
        }

        if (domain.indexOf(".aolcdn.com") >= 0) {
            var regex1 = /.*image_uri=([^&]*).*/;

            if (src.match(regex1)) {
                newsrc = decodeURIComponent(src.replace(/.*image_uri=([^&]*).*/, "$1"));
            } else {
                newsrc = decodeURIComponent(src).replace(/.*o\.aolcdn\.com\/images\/[^:]*\/([^:/]*:.*)/, "$1");
            }

            if (newsrc !== src)
                return newsrc;
        }

        if (domain.indexOf("imagesvc.timeincapp.com") >= 0) {
            // http://imagesvc.timeincapp.com/v3/foundry/image/?q=70&w=1440&url=https%3A%2F%2Ftimedotcom.files.wordpress.com%2F2017%2F11%2Fcolumbia-1.jpg%3Fquality%3D85
            //   https://timedotcom.files.wordpress.com/2017/11/columbia-1.jpg
            return decodeURIComponent(src.replace(/.*image\/?\?.*url=([^&]*).*/, "$1"));
        }

        if (domain.indexOf(".photoshelter.com") >= 0) {
            return src.replace(/\/s\/[0-9]*\/[0-9]*\//, "/");
        }

        if (domain.indexOf("www.celebzz.com") >= 0 && src.indexOf("/wp-content/uploads/") >= 0) {
            return src.replace(/-[0-9]+x[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf("images-na.ssl-images-amazon.com") >= 0 ||
            domain.indexOf("images-eu.ssl-images-amazon.com") >= 0 ||
            domain.indexOf(".images-amazon.com") >= 0 ||
            domain.indexOf(".ssl-images-amazon.com") >= 0 ||
            domain.indexOf(".media-amazon.com") >= 0 ||
            domain === "i.gr-assets.com") {
            // https://images-eu.ssl-images-amazon.com/images/I/41TMMGD0XZL._SL500_AC_SS350_.jpg
            // https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/users/1497668011i/22813064._UX100_CR0,0,100,100_.jpg
            // https://m.media-amazon.com/images/I/61rtKO6VrUL._SL500_.jpg
            // http://ec2.images-amazon.com/images/I/81IotHEYjBL._AA1417_.jpg
            return src.replace(/\._[^/]*\.([^./]*)$/, "._.$1");
        }

        /*if (domain.indexOf("cdn-img.instyle.com") >= 0) {
            return src.replace(/(\/files\/styles\/)[^/]*(\/public)/, "$1original$2");
        }

        if (domain.indexOf("static.independent.co.uk") >= 0) {
            return src.replace(/(\/styles\/)story_[^/]*(\/public)/, "$1story_large$2");
        }*/

        // drupal
        // https://italyxp.com/sites/default/files/mediaitalyxp/vesuvius.jpg?width=820&height=620&iframe=true
        if (domain.indexOf("cdn-img.instyle.com") >= 0 ||
            domain.indexOf("static.independent.co.uk") >= 0 ||
            domain.indexOf("static.standard.co.uk") >= 0 ||
            domain.indexOf("www.billboard.com") >= 0 ||
            domain.indexOf("www.harpersbazaararabia.com") >= 0 ||
            domain.indexOf("www.etonline.com") >= 0 ||
            domain.indexOf("o.oystermag.com") >= 0 ||
            domain.indexOf("www.metro.us") >= 0 ||
            domain.indexOf("www.mtv.co.uk") >= 0 ||
            domain.indexOf("www.grammy.com") >= 0 ||
            domain.match(/cdn[0-9]*\.thr\.com/) ||
            domain.match(/s[0-9]*\.ibtimes\.com/) ||
            // https://www.standard.co.uk/s3fs-public/styles/hero_tablet/public/thumbnails/image/2014/11/18/15/nickhewer4.jpg
            //   https://www.standard.co.uk/s3fs-public/thumbnails/image/2014/11/18/15/nickhewer4.jpg
            //
            // https://www.standard.co.uk/s3fs-public/image/2014/11/18/15/nickhewer4.jpg
            // is redirected to:
            // http://www.standard.co.uk/s3/files/image/2014/11/18/15/nickhewer4.jpg
            // which is not found
            // but replacing /s3fs-public/ to /s3/files/ doesn't work
            domain === "www.standard.co.uk" ||
            // https://media.pri.org/s3fs-public/styles/story_main/public/story/images/coco-movie.jpg?itok=Uo82G_FI
            src.match(/\/s3fs-public\/styles\/[^/]*\/public\//) ||
            domain === "media.pri.org" ||
            // http://cdn.whodoyouthinkyouaremagazine.com/sites/default/files/imagecache/623px_wide/episode/hewer500.jpg
            //   http://cdn.whodoyouthinkyouaremagazine.com/sites/default/files/episode/hewer500.jpg
            src.match(/\/sites\/[^/]*\/files\/styles\/[^/]*/) ||
            src.match(/\/sites\/[^/]*\/files\/[^/]*\/styles\/[^/]*/) ||
            src.match(/\/sites\/[^/]*\/files\/imagecache\/[^/]*/) ||
            src.search(/\/files\/styles\/[^/]*\/public\//) >= 0 ||
            // https://www.straight.com/files/v3/styles/gs_large/public/2013/09/MUS_Nostalghia_2386.jpg
            //   https://www.straight.com/files/v3/2013/09/MUS_Nostalghia_2386.jpg
            src.search(/\/files\/[^/]*\/styles\/[^/]*\/public\//) >= 0) {
            return src.replace(/\/styles\/.*?\/public\//, "/").replace(/\/imagecache\/[^/]*\//, "/").replace(/\?.*$/, "");
        }

        if (domain.indexOf("www.trbimg.com") >= 0) {
            return src.replace(/\/[0-9]*\/[0-9]*x[0-9]*\/*$/, "/").replace(/\/[0-9]*\/*$/, "/");
        }

        if (domain.indexOf(".bp.blogspot.com") >= 0 ||
            src.search(/\/lh[0-9]\.googleusercontent\.com\//) >= 0 ||
            src.search(/\/ci[0-9]\.googleusercontent\.com\//) >= 0 ||
            domain.indexOf(".ggpht.com") >= 0) {
            return src
                .replace(/#.*$/, "")
                .replace(/\/[swh][0-9]*(-[^/]*]*)?\/([^/]*)$/, "/s0/$2")
                .replace(/(=[^/]*)?$/, "=s0");
        }

        if (domain.indexOf("images.thestar.com") >= 0) {
            return src.replace(/(\/[^/.]*\.[^/.]*)\.[^/]*$/, "$1");
        }

        if (domain.indexOf("cdn.narcity.com") >= 0) {
            return src.replace(/(\/[^/.]*\.[^/._]*)_[^/]*$/, "$1");
        }

        if (domain.indexOf("images.vanityfair.it") >= 0) {
            return src.replace(/(\/gallery\/[0-9]*\/)[^/]*\//, "$1Original/");
        }

        if (domain.indexOf(".r29static.com") >= 0) {
            // http://s1.r29static.com//bin/entry/812/0,12,460,552/0x864,80/1207816/image.jpg
            // 0x0,100 and x,100 both work
            return src.replace(/\/bin\/entry\/([^/]*)\/(?:[0-9]+,[0-9]+,[0-9]+,[0-9]+\/)?[^/]*(,[^/]*)?\/([^,]*)$/, "/bin/entry/$1/x,100/$3");
        }

        if (domain.indexOf("img.huffingtonpost.com") >= 0) {
            // http://img.huffingtonpost.com/asset/5936853f2200003d00c6c785.png
            // http://img.huffingtonpost.com/asset/5a6b56b02d00004900942e4e.jpeg
            return src.replace(/\/asset\/[^/]*\/([^/.]*\.[^/.]*)$/, "/asset/$1").replace(/\?[^/]*$/, "");
        }

        if (domain === "images.huffingtonpost.com") {
            // https://images.huffingtonpost.com/2015-12-15-1450212883-2879887-356670f8740946d741c648b23_villarufologardensravellocampaniaitalycrgetty-thumb.jpg
            //   https://images.huffingtonpost.com/2015-12-15-1450212883-2879887-356670f8740946d741c648b23_villarufologardensravellocampaniaitalycrgetty.jpg
            return src.replace(/-thumb(\.[^/.]*)$/, "$1");
        }

        if (domain === "i.huffpost.com" ||
            domain === "s-i.huffpost.com") {
            // https://i.huffpost.com/gen/1557988/thumbs/o-EMMA-570.jpg
            // https://i.huffpost.com/gen/1557988/images/o-EMMA-570.jpg
            // https://i.huffpost.com/gen/3142438/images/o-LORD-SUGAR-570.jpg
            // https://i.huffpost.com/gen/4681756/thumbs/o-601718112-900.jpg
            // https://i.huffpost.com/gen/4681864/thumbs/o-601718288-900.jpg?2
            // https://s-i.huffpost.com/gen/4681864/original.jpg
            // https://i.huffpost.com/gen/3217980/images/n-JAZMIN-GRACE-GRIMALDI-628x314.jpg
            // https://i.huffpost.com/gen/816377/original.jpg

            // http://i.huffpost.com/gadgets/slideshows/331487/slide_331487_3313386_free.jpg
            // http://i.huffpost.com/gadgets/slideshows/331487/slide_331487_3313616_free.jpg
            // http://i.huffpost.com/gadgets/slideshows/366854/slide_366854_4186736_compressed.jpg
            // http://i.huffpost.com/gadgets/slideshows/278815/slide_278815_2063217_original.jpg
            return src
                .replace(/(\/gadgets\/slideshows\/[0-9]*\/slide_[^/]*_)[a-z]*(\.[^/.]*)$/, "$1original$2")
                .replace(/(\/gen\/[0-9]*\/).*(\.[^/.?]*)(?:\?[^/]*)?$/, "$1original$2");
        }

        if ((domain.indexOf(".washingtonpost.com") >= 0 ||
             // https://c.o0bg.com/rf/image_371w/Boston/2011-2020/2018/01/03/BostonGlobe.com/Arts/Images/AFP_V03Q8.jpg
             domain === "c.o0bg.com" ||
            domain === "www.hindustantimes.com") &&
            src.indexOf("/rf/") >= 0) {
            // test: https://img.washingtonpost.com/rf/image_1483w/2010-2019/Wires/Online/2017-11-21/AP/Images/Music_Taylor_Swift_36357.jpg
            // error: Query String : src=http://www.washingtonpost.com/rw/2010-2019/Wires/Online/2017-11-21/AP/Images/Music_Taylor_Swift_36357.jpg&w=1483
            // real: https://img.washingtonpost.com/rf/image_1484w/2010-2019/Wires/Online/2017-11-21/AP/Images/Music_Taylor_Swift_36357.jpg-ced9a.jpg?uuid=TiTSis5fEeeoe0fxS3MWKg

            // https://www.washingtonpost.com/rf/image_480x320/2010-2019/WashingtonPost/2018/01/26/Foreign/Images/AFP_XY105.jpg?t=20170517a
            //   https://www.washingtonpost.com/rw/2010-2019/WashingtonPost/2018/01/26/Foreign/Images/AFP_XY105.jpg

            // https://www.hindustantimes.com/rf/image_size_960x540/HT/p2/2018/01/08/Pictures/susan-sarandon-watson-clemente-marai-larasi-emma_f6e96a02-f475-11e7-95e6-04e0a17510b6.jpg - stretched
            //   https://www.hindustantimes.com/rf/image/HT/p2/2018/01/08/Pictures/susan-sarandon-watson-clemente-marai-larasi-emma_f6e96a02-f475-11e7-95e6-04e0a17510b6.jpg
            // https://www.hindustantimes.com/rf/image_size_90x90/HT/p2/2018/01/27/Pictures/parliament-session_d792b3aa-037c-11e8-8651-33050e64100a.jpg
            //   https://www.hindustantimes.com/rf/image/HT/p2/2018/01/27/Pictures/parliament-session_d792b3aa-037c-11e8-8651-33050e64100a.jpg
            // https://www.hindustantimes.com/rf/image_size_960x540/HT/p2/2018/01/27/Pictures/parliament-session_d146b4e2-037c-11e8-8651-33050e64100a.jpg
            //   https://www.hindustantimes.com/rf/image/HT/p2/2018/01/27/Pictures/parliament-session_d146b4e2-037c-11e8-8651-33050e64100a.jpg
            // https://www.hindustantimes.com/rf/image_size_960x540/HT/p2/2018/01/08/Pictures/emma-watson_af695f5c-f475-11e7-95e6-04e0a17510b6.jpg
            //   https://www.hindustantimes.com/rf/image/HT/p2/2018/01/08/Pictures/emma-watson_af695f5c-f475-11e7-95e6-04e0a17510b6.jpg
            //   https://www.hindustantimes.com/rw/HT/p2/2018/01/08/Pictures/emma-watson_af695f5c-f475-11e7-95e6-04e0a17510b6.jpg

            // return src.replace(/\/image_size_[0-9]+x[0-9]+\//, "/image/");
            newsrc = src.replace(/(.*?:\/\/[^/]*\/)rf\/[^/]*\/(.*)$/, "$1rw/$2").replace(/[?&][^/]*$/, "");
            if (newsrc !== src) {
                return newsrc;
            }

            // replaced by a generic one
            //return src.replace(/.*\/wp-apps\/imrs\.php\?[^/]*src=/, "");
        }

        if (domain.indexOf("www.livemint.com") >= 0) {
            return src.replace(/\/rf\/[^/]*\/(.*)$/, "/rw/$1");
        }

        if (domain.match(/^a[0-9]*\.foxnews\.com/)) {
            // http://a57.foxnews.com/images.foxnews.com/content/fox-news/world/2017/11/15/firefighters-in-thailands-capital-on-front-line-citys-fight-against-snakes/_jcr_content/par/featured_image/media-0.img.jpg/931/524/1510749948281.jpg?ve=1&tl=1
            // down for now?
            console.log(src.replace(/.*\/a[0-9]*\.foxnews\.com\/(.*).*/, "$1"));
            if (src.replace(/.*\/a[0-9]*\.foxnews\.com\/([^/]*).*/, "$1") !== "images.foxnews.com") {
                return src.replace(/.*\/a[0-9]*\.foxnews\.com\/(.*)\/[0-9]+\/[0-9]+\/([^/]*)$/, "http://$1/$2");
            }
            return src.replace(/(\/a[0-9]*\.foxnews\.com\/.*)\/[0-9]+\/[0-9]+\/([^/?]*)(?:\?.*)?$/, "$1/0/0/$2");
        }

        if (domain.indexOf("cdn.cliqueinc.com") >= 0) {
            // https://cdn.cliqueinc.com/posts/img/uploads/current/images/0/39/490/main.original.640x0c.jpg
            //   https://cdn.cliqueinc.com/posts/img/uploads/current/images/0/39/490/main.original.jpg
            return src.replace(/(\/[^/]*)\.[0-9]*x[0-9]*[^/.]*\.([^./]*)$/, "$1.$2");
        }

        if (domain.indexOf(".hubstatic.com") >= 0) {
            return src.replace(/_[^_/.]*\.([^/.]*)$/, ".$1");
        }

        if (domain.indexOf("cdninstagram.com") >= 0 ||
            domain.match(/^instagram\..*\.fbcdn\.net/)) {
            var urlstart = protocol + "://" + domain + "/";
            var has_t = false;
            for (i = 0; i < splitted.length; i++) {
                splitted[i] = splitted[i].replace(/\?.*$/, "");
                 if (splitted[i].match(/^t[0-9]+\.[0-9]+-[0-9]+$/)) {
                     urlstart += splitted[i] + "/";
                     has_t = true;
                 } else if (splitted[i].match(/^[0-9_]*_[a-z]+\.[a-z0-9]+$/)) {
                     if (!has_t) {
                         urlstart += "/";
                     }

                     urlstart += splitted[i];
                 }
            }
            return urlstart;
        }

        if (domain === "pbs.twimg.com" &&
            src.indexOf("pbs.twimg.com/media/") >= 0) {
            // https://pbs.twimg.com/media/DWREhilXkAAcafr?format=jpg&name=small
            //   https://pbs.twimg.com/media/DWREhilXkAAcafr.jpg:orig
            // https://pbs.twimg.com/media/DWO61F5X4AISSsF?format=jpg
            //   https://pbs.twimg.com/media/DWO61F5X4AISSsF.jpg:orig
            return src
                .replace(/(\/[^?&]*)([^/]*)[?&]format=([^&]*)/, "$1.$3$2")
                .replace(/(\/[^?&]*)[?&][^/]*$/, "$1")
                .replace(/(:[^/]*)?$/, ":orig");
        }

        if (domain === "pbs.twimg.com" &&
            src.indexOf("pbs.twimg.com/profile_images/") >= 0) {
            // https://pbs.twimg.com/profile_images/539057632435122178/1_MUcoAZ_bigger.jpeg
            //return src.replace(/_[a-zA-Z0-9]+\.([^/_]*)$/, "\.$1");
            return src.replace(/_bigger\.([^/_]*)$/, "\.$1").replace(/_normal\.([^/_]*)$/, "\.$1").replace(/_[0-9]+x[0-9]+\.([^/_]*)$/, "\.$1");
        }

        if (domain === "pbs.twimg.com" &&
            src.indexOf("pbs.twimg.com/card_img/") >= 0) {
            // https://pbs.twimg.com/card_img/958636711470223361/S0DycGGB?format=jpg&name=600x314
            //   https://pbs.twimg.com/card_img/958636711470223361/S0DycGGB?format=jpg&name=orig
            return src.replace(/(\?[^/]*&?name=)[^&/]*([^/]*)$/, "$1orig$2");
        }

        if (src.indexOf("pbs.twimg.com/profile_banners/") >= 0) {
            // https://pbs.twimg.com/profile_banners/811769379020947458/1503413326/1500x500 -- stretched
            //   https://pbs.twimg.com/profile_banners/811769379020947458/1503413326
            return src.replace(/\/[0-9]+x[0-9]+$/, "");
        }

        // disabling because too many urls are broken
        /*if (domain.indexOf("ytimg.googleusercontent.com") >= 0 ||
            domain.indexOf("i.ytimg.com") >= 0 ||
            domain.indexOf("img.youtube.com") >= 0) {
            // doesn't work for some urls:
            // https://i.ytimg.com/vi/o-gVbQHG0Ck/hqdefault.jpg
            return src.replace(/\/[^/]*$/, "/maxresdefault.jpg");
        }*/

        if (domain.indexOf("image.bugsm.co.kr") >= 0) {
            // blank image: (?version= doesn't impact)
            // https://image.bugsm.co.kr/artist/images/200/200498/20049877.jpg?version=20180108002103
            //   https://image.bugsm.co.kr/artist/images/0/200498/20049877.jpg
            //   https://image.bugsm.co.kr/artist/images/original/200498/20049877.jpg -- same
            //
            // non-blank image:
            // https://image.bugsm.co.kr/album/images/170/201403/20140343.jpg
            //   https://image.bugsm.co.kr/album/images/0/201403/20140343.jpg
            //
            // http://image.bugsm.co.kr/artist/images/original/801326/80132659.jpg
            return src.replace(/\/images\/[0-9]*\//, "/images/original/").replace(/\?.*$/, "");
        }

        if (domain.match(/i[0-9]\.wp\.com/)) {
            // https://i1.wp.com/img-aws.ehowcdn.com/default/cme/cme_public_images/www_ehow_com/photos.demandstudios.com/getty/article/240/3/178773543_XS.jpg?resize=400%2C267
            // http://i0.wp.com/mmsns.qpic.cn/mmsns/7KE858KbWtJWJFCnub4OrBAHial0SicILILia7G2I1h6VwXG5cWSWpnPQ/0 -- redirect error, but works
            return src.replace(/.*\/i[0-9]\.wp\.com\/(.*?)(?:\?.*)?$/, "http://$1");
        }

        if (domain.indexOf("imagesmtv-a.akamaihd.net") >= 0) {
            return src.replace(/.*\/uri\/([a-z:]*:)?/, "http://");
        }

        if (domain.indexOf("img.voi.pmdstatic.net") >= 0 ||
            domain.indexOf("voi.img.pmdstatic.net") >= 0) {
            var base = src.replace(/.*\/fit\/([^/]*)\/.*/, "$1");
            base = base.replace(/\./g, "%");
            base = decodeURIComponent(base);
            return base;
        }

        if (domain.indexOf("dynaimage.cdn.cnn.com") >= 0) {
            return decodeURIComponent(src.replace(/.*\/cnn\/[^/]*\//, ""));
        }

        if (domain.indexOf("wcmimages.torontosun.com") >= 0) {
            return decodeURIComponent(src.replace(/.*\/images\?[^/]*url=/, ""));
        }

        if (domain.indexOf("i.amz.mshcdn.com") >= 0) {
            return decodeURIComponent(src.replace(/.*i\.amz\.mshcdn\.com\/[^/]*\/[^/]*\/[^/]*\/([^/]*).*/, "$1"));
        }

        if (domain.indexOf("s.yimg.com") >= 0 ||
            domain === "l.yimg.com") {
            // http://l.yimg.com/bt/api/res/1.2/YIgTLkK5SkGYHzqDt4_e8Q--/YXBwaWQ9eW5ld3M7cT04NQ--/http:/mit.zenfs.com/316/2011/11/T-ZUCKERBERG_AP.jpg
            //   http://mit.zenfs.com/316/2011/11/T-ZUCKERBERG_AP.jpg
            // https://s.yimg.com/uu/api/res/1.2/dO0cMruL5vXOYMSnK577KQ--~B/aD03OTg7dz0xMzMwO3NtPTE7YXBwaWQ9eXRhY2h5b24-/https://s.yimg.com/cd/resizer/2.0/FIT_TO_WIDTH-w1330/a8b0bce04276cee4a1a80ea615a18c6e087e3b28.jpg
            //   https://s.yimg.com/cd/resizer/2.0/FIT_TO_WIDTH-w1330/a8b0bce04276cee4a1a80ea615a18c6e087e3b28.jpg
            return src
                .replace(/.*\/[^/]*\/api\/[^/]*\/[^/]*\/[^/]*\/[^/]*\//, "")
                .replace(/^([a-z]*:\/)([^/])/, "$1/$2");
        }

        if (domain.indexOf("image.iol.co.za") >= 0) {
            return decodeURIComponent(src.replace(/.*\/process\/.*\?.*source=([^&]*).*/, "$1"));
        }

        if (domain.indexOf("imageresizer.static9.net.au") >= 0) {
            //return decodeURIComponent(src.replace(/.*imageresizer\.static9\.net\.au\/[^=/]*=\/[0-9]+x[0-9]+\//, ""));
            return decodeURIComponent(src.replace(/.*imageresizer\.static9\.net\.au\/.*?\/([^/.?&]*%3A%2F%2F)/, "$1"));
        }

        if (domain.match(/^static[0-9]*\.squarespace\.com/)) {
            src = src.replace(/(\?[^/]*)?$/, "?format=original");
        }

        // /wp/uploads:
        // http://ksassets.timeincuk.net/wp/uploads/sites/46/2017/02/oscars.jpg

        if (domain.indexOf(".files.wordpress.com") >= 0 ||
            //domain.indexOf("typeset-beta.imgix.net") >= 0 ||
            // https://nylon-img.imgix.net/featured_images/attachments/000/008/458/original/Emma_Watson_Gravity_Premieres_NYC_Part_4_uWbHv1Bg6Owx.jpg?auto=format&ch=Width%2CDPR&q=75&w=640&ixlib=js-1.1.1&s=1587e8684f7fef1feac6d703480a760b
            (domain.indexOf(".imgix.net") >= 0 && !src.match(/[?&]s=[^/]*$/)) ||
            domain.indexOf("hmg-prod.s3.amazonaws.com") >= 0 ||
            domain.indexOf("blogs-images.forbes.com") >= 0 ||
            domain.indexOf("images-production.global.ssl.fastly.net") >= 0 ||
            domain.indexOf("typeset-beta.imgix.net") >= 0 ||
            domain.indexOf("imgix.elitedaily.com") >= 0 ||
            //domain.indexOf("cosmouk.cdnds.net") >= 0 ||
            // http://esquireuk.cdnds.net/15/37/2048x2730/2048x2730-felicity-jones-oscars-43-jpg-fe5ebdf1.jpg?resize=768:*
            domain.indexOf(".cdnds.net") >= 0 ||
            /*domain.indexOf("hbz.h-cdn.co") >= 0 ||
            domain.indexOf("cos.h-cdn.co") >= 0 ||*/
            domain.indexOf(".h-cdn.co") >= 0 ||
            domain.indexOf("cdn.newsapi.com.au") >= 0 ||
            domain.indexOf("images.indianexpress.com") >= 0 ||
            domain.indexOf("images.contentful.com") >= 0 ||
            domain.indexOf("imagesmtv-a.akamaihd.net") >= 0 ||
            domain.indexOf("d.ibtimes.co.uk") >= 0 ||
            // http://akns-images.eonline.com/eol_images/Entire_Site/2014519/rs_300x300-140619060824-600.Harry-Potter-Cast-JR-61914.jpg
            // http://akns-images.eonline.com/eol_images/Entire_Site/2014519/rs_1024x759-140619060822-1024.Harry-Potter-Cast-JR-61914.jpg
            domain.indexOf("akns-images.eonline.com") >= 0 ||
            domain.indexOf("www.telegraph.co.uk") >= 0 ||
            // http://subscriber.telegraph.co.uk/content/dam/news/2018/01/08/GettyImages-862428716_trans_NvBQzQNjv4BqZgEkZX3M936N5BQK4Va8RWtT0gK_6EfZT336f62EI5U.jpg?imwidth=480
            domain === "subscriber.telegraph.co.uk" ||
            // https://secure.aws.telegraph.co.uk/content/dam/wellbeing/2016/12/28/graham5_trans_NvBQzQNjv4BqNyaloxhBNUSEitvcqmzeaNrVK9LoR4c_wZH1EhIay9c.jpg?imwidth=480
            domain.indexOf("aws.telegraph.co.uk") >= 0 ||
            domain.indexOf("img.buzzfeed.com") >= 0 ||
            // p1.music.126.net
            domain.search(/p[0-9]\.music\.126\.net/) >= 0 ||
            domain.indexOf("stat.profile.ameba.jp") >= 0 ||
            domain.indexOf("stat.ameba.jp") >= 0 ||
            domain.indexOf("image.uczzd.cn") >= 0 ||
            domain.indexOf("img.danawa.com") >= 0 ||
            domain.indexOf("img-www.tf-cdn.com") >= 0 ||
            // https://6.viki.io/image/85db05c96d2c4a4ba4d6d2fa9798281c.jpeg?x=b&a=0x0&s=460x268&e=t&f=t&cb=1
            domain.indexOf(".viki.io") >= 0 ||
            domain.search(/avatars[0-9]*\.githubusercontent\.com/) >= 0 ||
            // https://bloximages.newyork1.vip.townnews.com/heraldmailmedia.com/content/tncms/assets/v3/editorial/1/9a/19a45cfe-354a-11e3-939d-001a4bcf6878/5800f2836b369.image.jpg?resize=1200%2C675
            domain.match(/bloximages\..*vip\.townnews\.com/) ||
            //domain === "bloximages.newyork1.vip.townnews.com" ||
            domain === "asset.wsj.net" ||
            domain === "steamuserimages-a.akamaihd.net" ||
            // haven't tested, but it's imgix
            domain === "image.assets.pressassociation.io" ||
            // http://media.immediate.co.uk/volatile/sites/3/2012/05/13874.jpg?quality=90&lb=620,413&background=white
            domain === "media.immediate.co.uk" ||
            // https://cdn.heatworld.com/one/lifestyle-images/celebrity/58357d749f0e322331739515/Screen%20Shot%202016-10-06%20at%2014.43.52.png?quality=50&width=960&ratio=16-9&resizeStyle=aspectfill&format=jpg
            domain === "cdn.heatworld.com" ||
            // https://www.thetimes.co.uk/imageserver/image/methode%2Fsundaytimes%2Fprodmigration%2Fweb%2Fbin%2F1ed9d88f-d652-4563-8d8b-fcbad22a1d0a.jpg?crop=1024%2C683%2C0%2C0&resize=685
            (domain === "www.thetimes.co.uk" && src.indexOf("/imageserver/") >= 0) ||
            // http://static.ok.co.uk/media/images/625x417_ct/737562_nick_hewer_9ab914ab8a82c5effdb695a41741ab84.jpg?w=900
            domain === "static.ok.co.uk" ||
            // https://media.gettyimages.com/photos/nick-hewer-arriving-for-the-2012-arqiva-british-academy-television-picture-id848052898?k=6&m=848052898&s=612x612&w=0&h=4QnBTCuNyp6nYhAumGR6k9gqH3iYagsnqkDo0ouGnts=
            domain === "media.gettyimages.com" ||
            // https://media.planetradio.co.uk/one/radio-legacy/52/fd06b/a5054/18c3c/83efe/bd389/d74d2/nickhewer.png?quality=80&width=960&ratio=16-9&resizeStyle=aspectfill&format=jpg
            domain === "media.planetradio.co.uk" ||
            // https://media.npr.org/assets/artslife/arts/2010/10/keith-richards/keith-richards_wide-68d0d5994c72c50de849d27e7c75519f2c832fc8.jpg?s=1400
            domain === "media.npr.org" ||
            // http://assets.teamrock.com/image/1cfd675c-33c9-4081-a27f-3f41abc88b69?w=800
            domain === "assets.teamrock.com" ||
            // https://media2.woopic.com/api/v1/images/156%2FS6N4g%2Fles-revoltes-rencontre-avec-simon-leclere-et-solene-rigot%7Cx240-WfM.jpg?format=300x175&facedetect=1&quality=85
            domain.match(/media[0-9]\.woopic\.com/) ||
            // http://md1.libe.com/photo/357188-de-gauche-a-droite-louise-grinberg-yara-pilartz-roxane-duran-solene-rigot-et-juliette-darche.jpg?modified_at=1322675617&width=975
            domain.match(/md[0-9]\.libe\.com/) ||
            // https://cdn.graziadaily.co.uk/one/lifestyle-images/celebrity/58bbdf7709f46d350a06910e/GettyImages-647330302.jpg?quality=50&width=960&ratio=16-9&resizeStyle=aspectfill&format=jpg
            domain === "cdn.graziadaily.co.uk" ||
            // https://regmedia.co.uk/2016/08/03/newsboy.jpg?x=442&y=293&crop=1
            domain === "regmedia.co.uk" ||
            // https://imageservice.nordjyske.dk/images/nordjyske.story/2012_05_12/961b43d2-64b8-47df-8c37-1c0e73565fb0.jpg?w=624&mode=crop&scale=both
            domain === "imageservice.nordjyske.dk" ||
            domain === "wac.450f.edgecastcdn.net" ||
            // http://www.gosoutheast.com/images/2015/9/29/Tony_Anderson-150917-JR.jpg?width=300
            domain === "www.gosoutheast.com" ||
            // http://itpro.nikkeibp.co.jp/atcl/column/17/010900605/011000014/ph01.jpg?__scale=w:450,h:501&_sh=0e0c309803
            domain === "itpro.nikkeibp.co.jp" ||
            // http://s-a4.best.gg/rosters/players/default2.png?image=c_fill,g_south,h_90,w_90
            domain.match(/s-a[0-9]*\.best\.gg/) ||
            // https://i5.walmartimages.com/asr/5375d30c-11a2-4725-a32d-cb59da53b5a5_1.20c1f4d2ccae8f4840ae88be99babb3e.jpeg?odnHeight=450&odnWidth=450&odnBg=FFFFFF
            domain.match(/i[0-9]*\.walmartimages\.com/) ||
            // https://nails.newsela.com/s3/newsela-media/article_media/2017/10/elem-hogwarts-express-rescue-fa623e3b.jpg?crop=0,139,1366,907&height=497&width=885
            domain === "nails.newsela.com" ||
            // http://ojsfile.ohmynews.com/CT_T_IMG/2018/0201/IE002279450_APP.jpg?2034
            domain === "ojsfile.ohmynews.com" ||
            // https://lumiere-a.akamaihd.net/v1/images/image_4cca1969.jpeg?region=0,0,512,288
            domain === "lumiere-a.akamaihd.net" ||
            // https://content.assets.pressassociation.io/2018/02/06210749/1324f25e-1b19-4315-9420-e8e027475cf2.jpg?rect=0,183,2355,1325&ext=.jpg
            domain === "content.assets.pressassociation.io" ||
            // http://www.xxlmag.com/files/2018/02/Iggy-Azalea-interview.jpeg?w=980&q=75
            domain === "www.xxlmag.com" ||
            // https://static01.nyt.com/images/2018/02/03/arts/03playlist/merlin_123145877_5ed2acde-72d5-4afb-a19a-93dbc29b5d2f-superJumbo.jpg?quality=100&auto=webp
            domain.match(/static[0-9]*\.nyt\.com/) ||
            // https://video-images.vice.com/articles/592ed99499168942accbdf39/lede/1496243427040-BadGyal_JavierRuiz_2.jpeg?crop=1xw:0.4212xh;0xw,0.3534xh&resize=1200:*
            // https://i-d-images.vice.com/images/2016/07/29/club-marab-cierra-su-temporada-con-bad-gyal-la-princesa-del-trap-cataln-body-image-1469779091.jpg?crop=1xw:0.5625xh;center,center&resize=0:*
            domain.indexOf("-images.vice.com") >= 0 ||
            // https://i.imgur.com/ajsLfCa_d.jpg?maxwidth=520&shape=thumb&fidelity=high
            domain === "i.imgur.com" ||
            // https://media.discordapp.net/attachments/170399623859404800/411963827412795394/CdynalsW4AQYsgy.png?width=223&height=300
            domain === "media.discordapp.net" ||
            // https://images.theconversation.com/files/159874/original/image-20170308-14932-n1fsc6.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1000&fit=clip
            domain === "images.theconversation.com" ||
            // https://www.rspb.org.uk/globalassets/images/birds-and-wildlife/non-bird-species-illustrations/grey-squirrel_1200x675.jpg?preset=landscape_mobile
            (domain === "www.rspb.org.uk" && src.indexOf("/globalassets/") >= 0) ||
            // http://trendy.nikkeibp.co.jp/atcl/column/17/011800066/020900003/01.jpg?__scale=w:400,h:267&_sh=08d0b10ff0
            // http://wol.nikkeibp.co.jp/atcl/column/15/011500044/021300142/icon_m.jpg?__scale=w:214,h:147&_sh=0820dc0240
            domain.indexOf(".nikkeibp.co.jp") >= 0 ||
            // http://media.beliefnet.com/~/media/photos/inspiration/galleries/20-most-beautiful-places-in-the-world/tunnel_of_love_ukraine.jpg?as=1&w=400
            domain === "media.beliefnet.com" ||
            // http://img.cdn2.vietnamnet.vn/Images/english/2017/11/10/09/20171110093351-sez.jpg?w=80&h=45
            domain.match(/img\.cdn[0-9]*\.vietnamnet\.vn/) ||
            // https://i.gadgets360cdn.com/large/tara_main_1511903994721.jpg?output-quality=70&output-format=webp
            domain === "i.gadgets360cdn.com" ||
            // https://i.ndtvimg.com/video/images/vod/medium/2018-02/big_478201_1517848813.jpg?downsize=298:224&output-quality=70&output-format=webp
            domain === "i.ndtvimg.com" ||
            // https://d3lp4xedbqa8a5.cloudfront.net/s3/digital-cougar-assets/Now/2018/02/16/44694/Healthy-pizza.jpg?width=132&height=107&mode=crop&scale=both&anchor=middlecenter&quality=85
            domain === "d3lp4xedbqa8a5.cloudfront.net" ||
            // https://brnow.org/getattachment/cc67f65b-b0b7-4365-abd5-258e4e1c1680?maxsidesize=50
            domain === "brnow.org" ||
            // https://p3.ssl.cdn.btime.com/t01b3d8cb1040fbe0ba.jpg?size=730x1110
            domain.match(/p[0-9]*\.(?:ssl\.)?cdn\.btime\.com/) ||
            // http://images.twistmagazine.com/uploads/images/file/21604/sabrina-carpenter-selfie.jpg?fit=crop&h=666&w=500
            domain === "images.twistmagazine.com" ||
            // https://sites.google.com/site/faustrolemodel/_/rsrc/1427391714266/sabrina-carpenter/452204682.jpg?height=400&width=331
            domain === "sites.google.com" ||
            // https://images.pexels.com/photos/68147/waterfall-thac-dray-nur-buon-me-thuot-daklak-68147.jpeg?h=350&auto=compress&cs=tinysrgb
            domain === "images.pexels.com" ||
            // https://images.unsplash.com/photo-1503320748329-9455bea97a68?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=324bf91b29fb196d6aefb2f4806d04c0&auto=format&fit=crop&w=1000&q=60
            domain === "images.unsplash.com" ||
            // tshop will automatically be replaced to shop
            // https://tshop.r10s.jp/book/cabinet/3966/4907953093966.jpg?fitin=200:300&composite-to=*,*|200:300
            //   https://shop.r10s.jp/book/cabinet/3966/4907953093966.jpg
            domain === "tshop.r10s.jp" ||
            // https://rakuma.r10s.jp/d/strg/ctrl/25/af89f9418a6f8fc899e2e0a280d79acd0c274d16.79.1.25.2.jpg?fit=inside%7C300%3A300
            domain === "rakuma.r10s.jp" ||
            // https://image.thanhnien.vn/Uploaded/phinp/2018_02_19/thumnail-bi-mat-tuan-anh_cms_VOVN.jpg?width=178&height=100&crop=auto&scale=both
            domain === "image.thanhnien.vn" ||
            // http://static.netlife.vn//2017/11/07/14/43/sao-han-trong-1-tuan-tara-den-viet-nam-2-lan_1.jpg?maxwidth=480
            domain === "static.netlife.vn" ||
            // http://rs.phunuonline.com.vn/staticFile/Subject/2018/02/14/7391244/unnamed_182138203.png?w=51&h=32
            domain === "rs.phunuonline.com.vn" ||
            // https://images.nbcolympics.com/www.nbcolympics.com/field_image/22February2018/shuster_smile.jpg?impolicy=960x540_rectangle
            domain === "images.nbcolympics.com" ||
            // https://compote.slate.com/images/4e1e4179-fb17-436b-a890-1a4fdb417d45.jpeg?width=1180&offset=0x0&rect=1560x1040&height=842
            domain === "compote.slate.com" ||
            // https://media.gannett-cdn.com/29906170001/29906170001_5720100432001_5720093419001-vs.jpg?pubId=29906170001&quality=10
            domain === "media.gannett-cdn.com" ||
            // http://www.rdfm-radio.fr/medias/images/media.nrj.fr-2f436x327-2f2017-2f11-2fbiographie-de-mc-fioti-484.jpg?fx=c_180_180
            domain === "www.rdfm-radio.fr" ||
            // http://image-api.nrj.fr/02_5a02579e3cb49.png?w=730&h=410
            domain === "image-api.nrj.fr" ||
            // http://api.hdwallpapers5k.com/resource/fileuploads/photos/albums/1400/5382c527-5081-4bf4-8b2b-25ea11356bf4.jpeg?quality=100&w=2560&h=2560&mode=crop
            domain === "api.hdwallpapers5k.com" ||
            // http://mtv.mtvnimages.com/uri/mgid:file:gsp:scenic:/international/mtvema/2017/images/nominees/Taylor_Swift_1940x720.jpg?quality=0.85&width=1024&height=450&crop=true
            domain === "mtv.mtvnimages.com" ||
            // http://images.en.koreaportal.com/data/images/full/14639/rita-ora.jpg?w=600
            domain.match(/images\.[^.]*\.koreaportal\.com/) ||
            // http://www.officialcharts.com/media/653733/taylor-swift-press-image-1100.jpg?width=796&mode=stretch
            (domain === "www.officialcharts.com" && src.indexOf("/media/") >= 0) ||
            // http://pix10.agoda.net/hotelImages/519/519394/519394_14031416100018704350.jpg?s=1024x768
            domain.match(/pix[0-9]*\.agoda\.net/) ||
            // https://images.pottermore.com/bxd3o8b291gf/1FC5pSmkSg44SMew0osm4Y/afb1fbf505eaf4c6a398b80ca075e014/DracoMalfoy_WB_F6_DracoMalfoyOnBathroomFloorHarryStanding_Still_080615_Land.jpg?w=1330&q=85
            domain === "images.pottermore.com" ||
            // https://www.google.com/s2/u/0/photos/public/AIbEiAIAAABECKjC6cfB5MXfkQEiC3ZjYXJkX3Bob3RvKig5NThhYjU1NjkzZGJkOTBmY2ZhZDAyYjE4NThjZjlmMzZmY2ZiZGY3MAHuuVSn2yIIP3390PZse6G3donZOg?sz=50
            (domain === "www.google.com" && src.match(/\/photos\/public\/[^/]*$/)) ||
            // https://images.streamable.com/east/image/pqxns_first.jpg?height=100
            domain === "images.streamable.com" ||
            // https://citywonders.com/media/11395/mt-vesuvius-crater.jpg?anchor=center&mode=crop&quality=65&width=1200&height=900
            domain === "citywonders.com" ||
            // https://cdn.amebaowndme.com/madrid-prd/madrid-web/images/sites/121508/7b13cca970a6eae1f46625638213900b_3a2cc2bd26844834e05b77f95b7500b7.jpg?width=724
            domain === "cdn.amebaowndme.com" ||
            // http://us.jimmychoo.com/dw/image/v2/AAWE_PRD/on/demandware.static/-/Sites-jch-master-product-catalog/default/dw70b1ebd2/images/rollover/LIZ100MPY_120004_MODEL.jpg?sw=245&sh=245&sm=fit
            // https://www.aritzia.com/on/demandware.static/-/Library-Sites-Aritzia_Shared/default/dw3a7fef87/seasonal/ss18/ss18-springsummercampaign/ss18-springsummercampaign-homepage/hptiles/tile-wilfred-lrg.jpg
            src.match(/\/demandware\.static\//) ||
            // https://cdn1.kongcdn.com/assets/avatars/defaults/robotboy.png?i10c=img.resize(width:40)
            src.match(/\?i10c=[^/]*$/) ||
            // http://hypebeast.com/wp-content/blogs.dir/4/files/2018/01/louis-vuitton-2018-fall-winter-50.jpg?q=75&w=400
            src.indexOf("/wp-content/blogs.dir/") >= 0 ||
            src.indexOf("/wp-content/uploads/") >= 0 ||
            src.indexOf("/wp/uploads/") >= 0) {
            src = src.replace(/\?[^/]*$/, "");
        }

        if (// https://c1.hoopchina.com.cn/uploads/star/event/images/180215/bmiddle-5e8c9e13a07a397579c89590685b479db07ff6b8.png?x-oss-process=image/resize,w_800/format,webp
            domain.match(/[ci][0-9]*\.hoopchina\.com\.cn/) ||
            // https://cdn.odigo.net/60168923a5f06af67f74250c44de7861.png?imageView2/2/w/800/interlace/1%7Cimageslim
            domain === "cdn.odigo.net" ||
            // https://i.linkeddb.com/person2/bc2b/4ac6/d18db22f165a63046031cbb9.jpg?x-oss-process=image/resize,m_fill,w_170,h_230
            domain === "i.linkeddb.com" ||
            // http://upload-images.jianshu.io/upload_images/1685198-ebfc2a22664f623c?imageMogr2/auto-orient/strip%7CimageView2/2/w/300
            domain === "upload-images.jianshu.io") {
            src = src.replace(/\?.*$/, "");
        }

        // check to make sure this doesn't break anything
        // test: https://s3.amazonaws.com/oscars-img-abc/wp-content/uploads/2017/02/26164054/950c51cde0a1cab411efdbf8f1abc117a6aad749397172c9b95dd3c47bfb6f6f-370x492.jpg
        if (//domain.indexOf(".files.wordpress.com") >= 0 || // doesn't work
            domain.indexOf(".imimg.com") >= 0 ||
            domain.indexOf("blogs-images.forbes.com") >= 0 ||
            domain.indexOf("static.gofugyourself.com") >= 0 ||
            domain.indexOf("static.thesuperficial.com") >= 0 ||
            // doesn't work:
            // http://static.celebuzz.com/uploads/2011/06/10/Emma-Roberts-Outside-Today-Show-in-NYC-e1435832610488-385x560.jpg
            // http://static.celebuzz.com/uploads/2011/06/10/Emma-Roberts-Outside-Today-Show-in-NYC.jpg
            // http://static.celebuzz.com/uploads/2011/06/10/Emma-Roberts-Outside-Today-Show-in-NYC-e1435832660684-310x560.jpg
            // http://static.celebuzz.com/uploads/2011/06/10/Emma-Roberts-Outside-Today-Show-in-NYC.JPG
            domain.indexOf("static.celebuzz.com") >= 0 ||
            domain.indexOf("img.vogue.co.kr") >= 0 ||
            domain.indexOf("static.spin.com") >= 0 ||
            domain.indexOf("zrockr.com") >= 0 ||
            // http://electricegg.co.uk/media/uploads/2017/08/nick-hewer-by-electric-egg-375x320.jpg
            domain.indexOf("electricegg.co.uk") >= 0 ||
            // http://www.media2.hw-static.com/media/2018/01/wenn_kerrywashington_012618-442x216.jpg
            domain.match(/www\.media[0-9]*\.hw-static\.com/) ||
            // http://i2.cdn.turner.com/money/dam/assets/160511121527-emma-watson-780x439.jpg
            domain.indexOf(".cdn.turner.com") >= 0 ||
            // http://k99.com/files/2013/01/JohnnyCarson_Facebook-630x477.jpg
            domain === "k99.com" ||
            // http://97rockonline.com/files/2012/07/Flag-Bikini-Venus-214x300.jpg
            domain === "97rockonline.com" ||
            // http://wfgr.com/files/2011/03/old-rich-woman-200x300.jpg
            domain === "wfgr.com" ||
            // http://wblk.com/files/2013/04/sirius-alien-630x355.jpg
            domain === "wblk.com" ||
            // http://fun107.com/files/2015/01/charlie-hunnam-and-chris-hemsworth-630x346.jpg
            domain === "fun107.com" ||
            // http://965kvki.com/files/2013/12/christmasgenius-630x472.jpg
            domain === "965viki.com" ||
            // http://1079ishot.com/files/2013/06/90713084-630x434.jpg
            domain === "1079ishot.com" ||
            // https://edge.alluremedia.com.au/m/l/2017/05/Surface-Laptop-410x231.png
            domain === "edge.alluremedia.com.au" ||
            // https://s3-us-west-1.amazonaws.com/blogs-prod-media/us/uploads/2016/06/02110848/Coco-Austin-breastfeeding-650x630.jpg
            (domain.indexOf(".amazonaws.com") >= 0 && src.match(/\/blogs-prod-media\/[^/]*\/uploads\//)) ||
            // https://d36tnp772eyphs.cloudfront.net/blogs/1/2014/08/8754021448_bf2a5c94a3_k-940x403.jpg
            domain === "d36tnp772eyphs.cloudfront.net" ||
            // http://img.allurekorea.com/allure/2016/10/style_581190dac6d83-835x1024.jpg
            domain === "img.allurekorea.com" ||
            // https://www.psu.com/app/uploads/2017/12/gang_beasts_review_01-1024x576.jpg
            domain === "www.psu.com" ||
            // http://media.popculture.com/2018/01/demi-lovato-fabletics-fitness-leggings-20022601-160x90.jpeg
            domain === "media.popculture.com" ||
            // http://www.rap-up.com/app/uploads/2018/02/rihanna-gpe-340x330.jpg
            domain === "www.rap-up.com" ||
            // http://img.snacker.hankyung.com/hk-content/2017/08/terracotta-army-1865006__340-400x300.jpg
            domain.match(/img\..*?\.hankyung\.com/) ||
            // https://www.traveltipy.com/content/uploads/2015/10/Gorlitz-Germany-1024x692.jpg
            domain === "www.traveltipy.com" ||
            // http://coveteur.com/content/uploads/2017/03/Emma-Roberts-Hair-3-940x940.jpg
            domain === "coveteur.com" ||
            // http://food-ehow-com.blog.ehow.com/files/2014/12/edits-2282-1024x682.jpg
            domain.indexOf(".blog.ehow.com") >= 0 ||
            // https://cdn2.theheartysoul.com/uploads/2016/06/image1-798x418.jpg
            domain.match(/cdn[0-9]*\.theheartysoul\.com/) ||
            // http://www.bandt.com.au/information/uploads/2017/08/Screen-Shot-2017-08-01-at-10.58.17-am-420x280.png
            domain === "www.bandt.com.au" ||
            // https://www.theepochtimes.com/assets/uploads/2017/08/28/Agriculture-dependent-to-the-river-5-700x420.jpg
            domain === "www.theepochtimes.com" ||
            // https://images.gamme.com.tw/news2/2018/82/30/pJySpaabj56WsKQ-300x250.jpg
            domain === "images.gamme.com.tw" ||
            // http://cdn.hoahoctro.vn/uploads/2018/02/5a87a07c09b7e-pagehihi-600x450.jpg
            domain === "cdn.hoahoctro.vn" ||
            // https://vnn-imgs-f.vgcloud.vn/2018/02/22/09/fan-xon-xao-mat-son-tung-beo-u-sau-tet-nguyen-dan-140x78.jpg
            domain === "vnn-imgs-f.vgcloud.vn" ||
            // http://f.imgs.vietnamnet.vn/2017/11/05/09/t-ara-roi-nuoc-mat-vi-fan-viet-4-100x30.jpg
            domain.indexOf(".imgs.vietnamnet.vn") >= 0 ||
            // https://static.vibe.com/files/archives/galleries/2005/01/23/ciara2-160x160.jpg
            domain === "static.vibe.com" ||
            // https://rightsinfo.org/app/uploads/2018/02/nathan-dumlao-378988-unsplash-1024x671.jpg
            domain === "rightsinfo.org" ||
            // http://img.marieclairekorea.com/2018/03/mck_5a9de416ee7a4-570x381.jpg
            domain === "img.marieclairekorea.com" ||
            // http://tokyopopline.com/images/2013/01/130106kara6-515x341.jpg
            domain === "tokyopopline.com" ||
            // https://media.extratv.com/2017/01/09/sophie-turner-getty-510x600.jpg
            domain === "media.extratv.com" ||
            // http://px1img.getnews.jp/img/archives/2017/10/ba35fadf68725a24224b306250f20c2f-1024x761.jpg
            domain === "px1img.getnews.jp" ||
            src.indexOf("/wp-content/uploads/") >= 0 ||
            src.indexOf("/wp/uploads/") >= 0) {
            // http://arissa-x.com/miss-x-channel/wp-content/uploads/2017/06/IMG_0005.jpg
            src = src.replace(/-[0-9]*x[0-9]*\.([^/.]*)$/, ".$1");
        }

        // http://www.mediaonlinevn.com/wp-content/uploads/2016/03/160315-pantech-launch-hcm-41_resize-680x365_c.jpg
        if (domain === "www.mediaonlinevn.com") {
            src = src.replace(/-[0-9]*x[0-9]*(?:_[a-z])?\.([^/.]*)$/, ".$1");
        }

        // http://felipepitta.com/blog/wp-content/uploads/2014/08/Harry-Potter-Hogwarts-Express-Jacobite-Fort-William-Scotland-Train(pp_w970_h646).jpg
        // http://www.onelittlepicture.com.au/wp-content/uploads/2012/07/IMG_0077a-copy-682x1024(pp_w599_h900).jpg
        if (domain.indexOf(".files.wordpress.com") >= 0 ||
            src.indexOf("/wp-content/uploads/") >= 0 ||
            src.indexOf("/wp/uploads/") >= 0) {
            src = src.replace(/\(pp_w[0-9]+_h[0-9]+\)(\.[^/.]*)$/, "$1");
        }

        // https://static.boredpanda.com/blog/wp-content/uploads/2017/08/GW-130817_DSC1426-copy-599f17eddebf2__880.jpg
        if (domain.indexOf(".files.wordpress.com") >= 0 ||
            src.indexOf("/wp-content/uploads/") >= 0 ||
            src.indexOf("/wp/uploads/") >= 0) {
            src = src.replace(/__[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf("storage.journaldemontreal.com") >= 0 ||
            domain.indexOf("storage.torontosun.com") >= 0 ||
            // http://storage.journaldequebec.com/v1/dynamic_resize/sws_path/jdx-prod-images/e3b49bbd-ba13-4f0e-99e4-e0d0ee77bbfe_ORIGINAL.jpg?quality=80&size=700x&version=1
            domain === "storage.journaldequebec.com") {
            //return src.replace(/(\/dynamic_resize\/.*)\?[^/]*$/, "$1?size=99999999");
            return src.replace(/\/dynamic_resize\/[^/]*\//, "/").replace(/\?[^/]*$/, "");
        }

        if (domain.indexOf("pictures.ozy.com") >= 0) {
            return src.replace(/\/pictures\/[0-9]*x[0-9]*\//, "/pictures/99999999x99999999/");
        }

        if (domain.indexOf("hips.hearstapps.com") >= 0) {
            // https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/bgus-1060427-037-1-1510856807.jpg
            //   http://hmg-prod.s3.amazonaws.com/images/bgus-1060427-037-1-1510856807.jpg
            // https://hips.hearstapps.com/rover/profile_photos/21445446-1bde-4290-a24e-2bdd274be027_1516741729.jpg?fill=1:1&resize=200:*
            //   https://hips.hearstapps.com/rover/profile_photos/21445446-1bde-4290-a24e-2bdd274be027_1516741729.jpg
            newsrc = src.replace(/.*hips\.hearstapps\.com\/([^/]+\.[^/]+)/, "http://$1");
            if (newsrc !== src)
                return newsrc;
            return src.replace(/\?[^/]*$/, "");
        }

        if (domain.indexOf("img.wennermedia.com") >= 0) {
            return src.replace(/img\.wennermedia\.com\/.*\/([^/]*)$/, "img.wennermedia.com/$1");
        }

        // specials-images.forbesimg.com
        if (domain.indexOf("images.forbesimg.com") >= 0) {
            return src.replace(/\/[0-9]*x[0-9]*\.([^/.?]*)(\?.*)?/, "/0x0.$1");
        }

        if (domain.indexOf("upload.wikimedia.org") >= 0 ||
            domain.indexOf("www.generasia.com") >= 0 ||
            // https://cdn.wikimg.net/strategywiki/images/thumb/0/01/PW_JFA_Official_Artwork.jpg/350px-PW_JFA_Official_Artwork.jpg
            domain === "cdn.wikimg.net" ||
            // http://liquipedia.net/commons/images/thumb/d/df/Tossgirl_2008_stx081014.jpg/269px-Tossgirl_2008_stx081014.jpg
            //   http://liquipedia.net/commons/images/d/df/Tossgirl_2008_stx081014.jpg
            domain === "liquipedia.net" ||
            src.match(/\/images\/thumb\/[^/]*\/[^/]*\/[^/]*\.[^/]*\/[0-9]*px-/)) {
            return src.replace(/\/thumb\/([^/]*)\/([^/]*)\/([^/]*)\/.*/, "/$1/$2/$3");
        }

        if (domain.indexOf("pixel.nymag.com") >= 0) {
            return src.replace(/\/([^/.]*)(\.[^/]*)?\.([^/.]*)$/, "/$1.$3");
        }

        if (domain.indexOf("assets.nydailynews.com") >= 0 ||
            domain.indexOf("i.cbc.ca") >= 0 ||
            domain.indexOf("cdn.newsday.com") >= 0 ||
            domain.indexOf("www.stripes.com") >= 0 ||
            domain.indexOf("www.thetimesnews.com") >= 0 ||
            domain.indexOf("www.irishtimes.com") >= 0 ||
            domain.indexOf("www.ctvnews.ca") >= 0 ||
            domain.indexOf("www.lancashirelife.co.uk") >= 0 ||
            domain.indexOf("www.edp24.co.uk") >= 0) {
            // http://www.lancashirelife.co.uk/polopoly_fs/1.1596808!/image/2417471173.jpg_gen/derivatives/landscape_490/2417471173.jpg
            return src
                .replace(/\/image\.[^_/]*_gen\/derivatives\/[^/]*\//, "/")
                .replace(/\/image\/[^_/]*_gen\/derivatives\/[^/]*\//, "/image/");
        }

        if (domain.match(/ichef(?:-[0-9]*)?.bbci.co.uk/)) {
            newsrc = src.replace(/\/[0-9]+_[0-9]+\//, "/original/");
            if (newsrc !== src)
                return newsrc;

            // http://ichef.bbci.co.uk/wwhp/999/cpsprodpb/7432/production/_99764792_8e240163-62f5-4b0f-bf90-6def2cdc883b.jpg
            //   http://ichef.bbci.co.uk/news/999/cpsprodpb/7432/production/_99764792_8e240163-62f5-4b0f-bf90-6def2cdc883b.jpg
            // https://ichef.bbci.co.uk/news/999/media/images/79831000/jpg/_79831755_hewer2_bbc.jpg
            //   https://news.bbcimg.co.uk/media/images/79831000/jpg/_79831755_hewer2_bbc.jpg
            // https://ichef-1.bbci.co.uk/news/235/cpsprodpb/A771/production/_99756824_trumpmueller.jpg
            // http://ichef.bbci.co.uk/news/999/mcs/media/images/79839000/jpg/_79839098_bbcnickhewer.jpg
            //   http://news.bbcimg.co.uk/media/images/79839000/jpg/_79839098_bbcnickhewer.jpg
            // http://news.bbcimg.co.uk/news/special/2016/newsspec_15380/img/trump_annotated_976v2.png
            // http://news.bbcimg.co.uk/news/special/2017/newsspec_17595/img/hurricane_globe_v6.gif
            // http://ichef.bbci.co.uk/news/976/cpsprodpb/11B74/production/_88046527_getty_ora.jpg
            //   http://news.bbcimg.co.uk/media/images/88046527/jpg/_88046527_getty_ora.jpg -- not found
            //   http://c.files.bbci.co.uk/11B74/production/_88046527_getty_ora.jpg
            // http://news.bbcimg.co.uk/media/images/74104000/jpg/_74104195_6671990f-809f-432b-8699-7b5b92d053a0.jpg
            // http://news.bbcimg.co.uk/media/images/61015000/jpg/_61015960_3a79d215-7772-4ec1-b157-1655c66793ad.jpg
            // http://news.bbcimg.co.uk/news/special/2016/newsspec_12799/content/full-width/common/img/italy_graves_intro_1400.jpg
            // https://ichef.bbci.co.uk/onesport/cps/800/cpsprodpb/41F9/production/_98998861_ragnbone.jpg
            // http://c.files.bbci.co.uk/28EE/production/_98587401_afoty_624x351_player5.jpg
            //
            //
            // different cropping:
            // https://ichef.bbci.co.uk/news/999/cpsprodpb/01C8/production/_99765400_hi039575218.jpg
            // https://ichef.bbci.co.uk/news/999/cpsprodpb/DB2A/production/_99760165_hi039575218.jpg
            // http://news.bbcimg.co.uk/media/images/99765000/jpg/_99765400_hi039575218.jpg - doesn't work
            newsrc = src.replace(/.*\.bbci\.co\.uk\/news\/[0-9]*\/(?:[^/]*\/)?media\//, "http://news.bbcimg.co.uk/media/");
            if (newsrc !== src)
                return newsrc;

            return src.replace(/.*\/cpsprodpb\//, "https://c.files.bbci.co.uk/");

            /*var origsize = src.match(/\.bbci\.co\.uk\/[^/]*\/([0-9]*)\//);
            if (origsize && false) { // scales up
                var size = parseInt(origsize[1], 10);
                if (size < 2048) {
                    return src.replace(/(\.bbci\.co\.uk\/[^/]*)\/[0-9]*\//, "$1/2048/");
                }
            }*/
        }

        if (domain === "amp.thisisinsider.com") {
            // https://amp.thisisinsider.com/images/58c2c3d580c5ac1f008b47dc-960-1545.jpg
            //   https://static2.thisisinsider.com/image/58c2c3d580c5ac1f008b47dc/
            return urljoin(src, src.replace(/.*\/images\/([^-]*)[^/]*(\.[^/.]*)$/, "//static2.thisisinsider.com/image/$1/"));
        }

        /*if (domain.match(/static[0-9]*\.thisisinsider\.com/)) {
            // http://static2.thisisinsider.com/image/58c2c3d580c5ac1f008b47dc-200/
            //   https://static2.thisisinsider.com/image/58c2c3d580c5ac1f008b47dc/
            return src.replace(/(\/image\/[^/]*)-[0-9]*(\/[^/]*)$/, "$1$2");
        }*/

        if (domain.match(/static[0-9]*(?:\.[^/.]*)?\.businessinsider\.com/) ||
            domain.match(/static[0-9]*(?:\.[^/.]*)?\.thisisinsider\.com/)) {
            // http://static2.thisisinsider.com/image/58c2c3d580c5ac1f008b47dc-200/
            //   https://static2.thisisinsider.com/image/58c2c3d580c5ac1f008b47dc/
            // http://static6.uk.businessinsider.com/image/58ae09acdd089506308b4ad1-2377/undefined
            //   http://static6.uk.businessinsider.com/image/58ae09acdd089506308b4ad1/undefined
            return src
                .replace(/\/image\/([^-/]*)[^/]*\//, "/image/$1/");
        }

        if (domain.indexOf("media.nbcwashington.com") >= 0 ||
            domain.indexOf("media.nbcnewyork.com") >= 0 ||
            domain === "media.nbcchicago.com") {
            // https://media.nbcnewyork.com/images/653*367/AP_18012240030020.jpg
            // https://media.nbcchicago.com/images/652*367/t-swift-cover.jpg
            return src.replace(/\/images\/[0-9]+\*[0-9]+\//, "/images/");
        }

        if (domain.indexOf("www.bet.com") >= 0) {
            // https://www.bet.com/style/living/2018/01/29/chrissy-teigen-gender-reveal/_jcr_content/squareImage.featured1x1.dimg/__1517248018208__1517242933377/012918-style-chrissy-teigen-gender-reveal.jpg
            //   https://www.bet.com/style/living/2018/01/29/chrissy-teigen-gender-reveal/_jcr_content/bodycopycontainer/embedded_image_0/image.custom0fx0fx0xcrop.dimg/__1517248018208__1517242933377/012918-style-chrissy-teigen-gender-reveal.jpg
            // https://www.bet.com/style/beauty/2018/01/30/cheap-beauty-products-celebrities-use/_jcr_content/bodycopycontainer/listiclecontainer/listicleitem_3/embedded_image/image.custom1200x1581.dimg/__1516987722286__1516987306610/012618-style-yara-shahidi-cheap-beauty-products.jpg
            // https://www.bet.com/style/fashion/2018/01/28/see-all-the-looks-from-the-grammy-s-2018-red-carpet/_jcr_content/squareImage.featuredlist.dimg/__1517191072539__1517189173163/012818-style-grammy-looks-1.jpg
            // https://www.bet.com/style/fashion/2018/01/28/see-rihanna-slay-a-patent-trench-as-she-accepted-a-grammy-award-/_jcr_content/image.ampheroimage.dimg/__1517189314895__1517188008118/012818-style-see-rihanna-slay-a-patent-trench-as-she-accepted-a-grammy-award.jpg
            // https://www.bet.com/style/living/2018/02/01/leslie-jones-meagan-good-body-positivity-black-girl-magic/_jcr_content/squareImage.relatedinline1x1.dimg/__1517510003204__1517501332582/020118-Celebs-Leslie-Jones-Megan-Good.jpg
            // https://www.bet.com/style/fashion/2018/01/31/jennifer-lopez-shows-off-toned-legs/_jcr_content/image.feedcontainer.dimg/__1517429162639__1517412507314/013118-style-jennifer-lopez-shows-off-toned-legs-3.jpg
            return src
                .replace(/\/(_jcr_content.*?\/[^/]*)\.custom[0-9]+fx[0-9]+fx[0-9]+xcrop\.([^/]*)\//, "/$1.custom0fx0fx0xcrop.$2/")
                .replace(/\/(_jcr_content.*?\/[^/]*)\.custom[0-9]+x[0-9]+\.([^/]*)\//, "/$1.custom0fx0fx0xcrop.$2/")
                .replace(/\/(_jcr_content.*?\/[^/]*)\.featured[0-9]+x[0-9]+\.([^/]*)\//, "/$1.custom0fx0fx0xcrop.$2/")
                .replace(/\/(_jcr_content.*?\/[^/]*)\.featuredlist\.([^/]*)\//, "/$1.custom0fx0fx0xcrop.$2/")
                .replace(/\/(_jcr_content.*?\/[^/]*)\.ampheroimage\.([^/]*)\//, "/$1.custom0fx0fx0xcrop.$2/")
                .replace(/\/(_jcr_content.*?\/[^/]*)\.feedcontainer\.([^/]*)\//, "/$1.custom0fx0fx0xcrop.$2/")
                .replace(/\/(_jcr_content.*?\/[^/]*)\.[^/.]*\.([^/]*)\//, "/$1.custom0fx0fx0xcrop.$2/")
                .replace(/\/(_jcr_content.*?\/[^/]*)\.relatedinline[0-9]+x[0-9]+\.([^/]*)\//, "/$1.custom0fx0fx0xcrop.$2/");
                //.replace(/\/_jcr_content\/.*(\/[^/]*)$/, "/_jcr_content/bodycopycontainer/embedded_image_0/image.custom0fx0fx0xcrop.dimg/$1");
        }

        if (domain.match(/cbsnews[0-9]*\.cbsistatic\.com/) ||
            domain.match(/zdnet[0-9]*\.cbsistatic\.com/) ||
            domain.indexOf("cimg.tvgcdn.net") >= 0) {
            // https://zdnet1.cbsistatic.com/hub/i/r/2018/01/12/2dcbd29f-f3fa-4283-b11a-e163c03bbc08/resize/770xauto/99721c4b340e885277343e7f6cb4b6c3/ndcboom1-alt.jpg
            //   https://zdnet1.cbsistatic.com/hub/i/r/2018/01/12/2dcbd29f-f3fa-4283-b11a-e163c03bbc08/99721c4b340e885277343e7f6cb4b6c3/ndcboom1-alt.jpg
            // https://zdnet4.cbsistatic.com/hub/i/r/2018/02/06/1eef8bb5-4034-4e88-b356-ff9b035778d9/thumbnail/170x128/122ea3f0f9d0c3b86c23c3ff362ad252/brooke-cagle-195777.jpg
            //   https://zdnet4.cbsistatic.com/hub/i/r/2018/02/06/1eef8bb5-4034-4e88-b356-ff9b035778d9/122ea3f0f9d0c3b86c23c3ff362ad252/brooke-cagle-195777.jpg
            return src
                .replace(/\/resize\/[0-9a-z]*x[0-9a-z]*\//, "/")
                .replace(/\/crop\/[^/]*\//, "/")
                .replace(/\/thumbnail\/[^/]*\//, "/");
        }

        if (domain.match(/cnet[0-9]*\.cbsistatic\.com/)) {
            // https://cnet3.cbsistatic.com/img/FK8CGJDejVV-sEaEJZ2nXW8eM3k=/1600x900/2017/03/15/a2595ca5-43fc-4508-9c36-745b04dd49a1/coco2.jpg
            //   https://cnet3.cbsistatic.com/img/2017/03/15/a2595ca5-43fc-4508-9c36-745b04dd49a1/coco2.jpg
            // https://cnet1.cbsistatic.com/img/nCMng7w4iuS_uxiPM4wghBjtQBg=/81x398:2438x2724/0x527/2017/05/08/9f832785-f506-4ec3-b175-f85723d123dc/ew-opener.jpg
            //   https://cnet1.cbsistatic.com/img/2017/05/08/9f832785-f506-4ec3-b175-f85723d123dc/ew-opener.jpg
            // https://cnet1.cbsistatic.com/img/DIHwjRMV2yd28ex651bXyFnHQmE=/2017/12/27/3397f9e3-e1b9-4630-8e14-451a97546d32/dsc01630.jpg
            //   https://cnet1.cbsistatic.com/img/2017/12/27/3397f9e3-e1b9-4630-8e14-451a97546d32/dsc01630.jpg
            return src.replace(/\/img\/[^/]*=\/(?:[0-9]+x[0-9]+:[0-9]+x[0-9]+\/)?(?:[0-9]+x[0-9]+\/)?(.*)/, "/img/$1");
        }

        if (domain.match(/wwwimage[0-9]*\.cbsstatic\.com/)) {
            // http://wwwimage2.cbsstatic.com/thumbnails/photos/w370/blog/abd70cf777ca6a77_marissa_golds_guide_1920.jpg
            //   http://wwwimage2.cbsstatic.com/base/files/blog/abd70cf777ca6a77_marissa_golds_guide_1920.jpg
            // http://wwwimage.cbsstatic.com/thumbnails/photos/files/asset/10/00/56/47/927857742dd31df2_dianes_world.jpg
            //   http://wwwimage.cbsstatic.com/base/files/asset/10/00/56/47/927857742dd31df2_dianes_world.jpg
            // http://wwwimage4.cbsstatic.com/thumbnails/videos/w270/CBS_Production_Entertainment_VMS/761/811/2018/02/06/1145406531709/CBS_SCORPION_416_IMAGE_NO_LOGO_thumb_Master.jpg
            //   http://wwwimage4.cbsstatic.com/thumbnails/videos/files/CBS_Production_Entertainment_VMS/761/811/2018/02/06/1145406531709/CBS_SCORPION_416_IMAGE_NO_LOGO_thumb_Master.jpg
            // http://wwwimage2.cbsstatic.com/thumbnails/photos/770xh/danielle_big_brother_over_the_top.jpg
            // http://wwwimage2.cbsstatic.com/thumbnails/photos/100q/danielle_big_brother_over_the_top.jpg
            //
            // error:
            //Not enough parameters were given.
            //
            //Available parameters:
            //w = Maximum width
            //h = Maximum height
            //c = Crop ratio (width:height)
            //q = Quality (0-100)
            //b = Background fill color (RRGGBB or RGB)
            //p = Progressive (0 or 1)
            //
            //Example usage:
            // http://wwwimage2.cbsstatic.com/thumbnails/photos/w300-h300-c1:1/path/to/image.jpg
            return src
                //.replace(/\/thumbnails\/([^/]*)\/[wh][0-9]*\//, "/thumbnails/$1/files/")
                .replace(/\/thumbnails\/([^/]*)\/[-a-z0-9:]*\//, "/thumbnails/$1/files/")
                .replace("/thumbnails/photos/files/", "/base/files/");
        }

        if (domain === "api.fidji.lefigaro.fr") {
            // http://api.fidji.lefigaro.fr/media/ext/1900x/madame.lefigaro.fr/sites/default/files/img/2015/01/defile-valentino-automne-hiver-2015-2016-paris-look-46.jpg
            //   http://i.f1g.fr/media/ext/1900x/madame.lefigaro.fr/sites/default/files/img/2015/01/defile-valentino-automne-hiver-2015-2016-paris-look-46.jpg
            // http://api.fidji.lefigaro.fr/media/ext/1900x/img.tvmag.lefigaro.fr/ImCon/Arti/89615/PHO0ce17170-86bd-11e5-81ca-efc6b4cd613e-805x453.jpg
            //   http://i.f1g.fr/media/ext/1900x/img.tvmag.lefigaro.fr/ImCon/Arti/89615/PHO0ce17170-86bd-11e5-81ca-efc6b4cd613e-805x453.jpg
            return src.replace("://api.fidji.lefigaro.fr/", "://i.f1g.fr/");
        }

        if (domain.indexOf("i.f1g.fr") >= 0) {
            newsrc = src.replace(/.*i\.f1g\.fr\/media\/ext\/[^/]*\//, "http://");
            var newdomain = newsrc.replace(/^http:\/\/([^/]*)\/.*/, "$1");
            if (newsrc !== src &&
                newdomain !== "img.tvmag.lefigaro.fr")
                return newsrc;

            // http://svn.pimentech.org/pimentech/libcommonDjango/django_pimentech/pixr/views.py
            // mirror: https://pastebin.com/D7zPvfa1
            //
            // http://i.f1g.fr/media/figaro/493x100_crop/2017/03/28/XVM5540edbe-13a3-11e7-9e28-7b011fa4a165.jpg
            //   http://i.f1g.fr/media/figaro/orig/2017/03/28/XVM5540edbe-13a3-11e7-9e28-7b011fa4a165.jpg
            // http://i.f1g.fr/media/eidos/493x178_crop/2017/11/05/XVM758e1cb8-c212-11e7-b1f9-8e8a8cad8fcc.jpg
            //   http://i.f1g.fr/media/eidos/orig/2017/11/05/XVM758e1cb8-c212-11e7-b1f9-8e8a8cad8fcc.jpg
            return src.replace(/\/media\/([a-z]*)\/[^/]*\//, "/media/$1/orig/");
        }

        if (/*domain.indexOf("hbz.h-cdn.co") >= 0*/
            domain.indexOf(".h-cdn.co") >= 0 && src.indexOf("/assets/") >= 0) {
            return src.replace(/\/[0-9]*x[0-9]*\//, "/");
        }

        if (domain.indexOf("imgix.ranker.com") >= 0) {
            return src.replace(/\?[^/]*$/, "?fm=png");
        }

        // https://driftt.imgix.net/https%3A%2F%2Fdriftt.imgix.net%2Fhttps%253A%252F%252Fs3.amazonaws.com%252Fcustomer-api-avatars-prod%252F124400%252Fa382421eaa0c3184c7c1588a54a481014za77e245kzk%3Ffit%3Dmax%26fm%3Dpng%26h%3D200%26w%3D200%26s%3Db662f982cf04f9f733dcb1ce4522ee73?fit=max&fm=png&h=200&w=200&s=cd4c2695da2c9621a41fc14e92516b37
        //  https://driftt.imgix.net/https%3A%2F%2Fs3.amazonaws.com%2Fcustomer-api-avatars-prod%2F124400%2Fa382421eaa0c3184c7c1588a54a481014za77e245kzk?fit=max&fm=png&h=200&w=200&s=b662f982cf04f9f733dcb1ce4522ee73
        //   https://s3.amazonaws.com/customer-api-avatars-prod/124400/a382421eaa0c3184c7c1588a54a481014za77e245kzk
        if (domain.indexOf("driftt.imgix.net") >= 0) {
            return decodeURIComponent(src.replace(/.*?driftt\.imgix\.net\//, ""));
        }

        if (domain.indexOf("data.whicdn.com") >= 0) {
            return src.replace(/\/[^/.]*\.([^/.]*)$/, "/original.$1");
        }

        if (domain.indexOf("cdn.empireonline.com") >= 0) {
            // 12
            // https://cdn.empireonline.com/jpg/70/0/0/640/480/aspectfit/0/0/0/0/0/0/c/reviews_films/5a57bf3d652c21bb08ce7fc8/pixar-coco-concept-art.jpg
            //   https://cdn.empireonline.com/c/reviews_films/5a57bf3d652c21bb08ce7fc8/pixar-coco-concept-art.jpg
            // https://cdn.empireonline.com/jpg/80/0/0/300/170/0/north/0/0/0/0/0/c/reviews_films/5a73e5036bb57fce0af3b5ab/den-of-thieves-1.jpg
            //   https://cdn.empireonline.com/c/reviews_films/5a73e5036bb57fce0af3b5ab/den-of-thieves-1.jpg
            //return src.replace(/cdn\.empireonline\.com\/(?:jpg|png|gif)\/(?:[0-9]+\/){5}aspectfit\/(?:[0-9]+\/){6}/, "cdn.empireonline.com/");
            return src.replace(/cdn\.empireonline\.com\/(?:jpg|png|gif)\/(?:[^/.]+\/){12}/, "cdn.empireonline.com/");
            //return urljoin(src, src.replace(/cdn\.empireonline\.com\/(jpg)|(png)|(gif)\/[^/]*\/[^/]*\/[^/]*\/[^/]*\/[^/]*\/[^/]*\/[^/]*\/[^/]*\/[^/]*\/[^/]*\/[^/]*\/[^/]*\//, "/"));
        }

        if (domain.indexOf("ell.h-cdn.co") >= 0) {
            return src.replace(/(\/assets\/[^/]*\/[^/]*\/)[0-9]+x[0-9]+\//, "$1");
        }

        if (domain.indexOf("celebmafia.com") >= 0 ||
            domain.indexOf("hawtcelebs.com") >= 0) {
            return src.replace(/\/([^/]*)_thumbnail\.([^/.]*)$/, "/$1.$2");
        }

        if (domain.match(/[a-z]*[0-9]*\.pixhost\.org/)) {
            return src.replace(/\/t([0-9]*\.pixhost\.org)\/thumbs\//, "/img$1/images/");
        }

        /*if (domain.indexOf("ssli.ulximg.com") >= 0) {
            return src.replace(/\/image\/[0-9]+x[0-9]+\//, "/image/full/");
        }*/

        if (domain.indexOf(".ulximg.com") >= 0) {
            // https://sslh.ulximg.com/image/740x493/cover/1517447102_98a80a4ead45fe6ea39dba7f13d82d59.jpg/cf804979603806d94cb139fc0676f0ca/1517447102_4694e8c352198b439a03d90f0ea03910.jpg
            // doesn't work for all:
            // https://sslh.ulximg.com/image/740x493/cover/1517954740_3e7856551e64f1217860014d8853d1e1.jpg
            return src
                .replace(/\/image\/[0-9]*x[0-9]*\//, "/image/full/");
                //.replace(/(\/cover\/[^/.]*\.[^/.]*)\/.*/, "$1");
        }

        if (domain.indexOf("fm.cnbc.com") >= 0) {
            return src.replace(/\.[0-9]+x[0-9]+\.([^/.]*)$/, ".$1");
        }

        if (domain.indexOf("images.bwwstatic.com") >= 0) {
            return src.replace(/\/tn-[0-9]+_([^/]*)$/, "/$1");
        }

        if (domain.match(/images[0-9]*\.houstonpress\.com/)) {
            return src.replace(/(\/imager\/[^/]*\/)[^/]*\//, "$1original/");
        }

        if (domain.indexOf("img.rasset.ie") >= 0) {
            return src.replace(/(\/[^/]*)-[0-9]*(\.[^/.]*)$/, "$1-9999$2");
        }

        if (domain.indexOf("i.pinimg.com") >= 0) {
            // doesn't work:
            // https://i.pinimg.com/originals/1f/3f/ed/1f3fed6c284955934c7d724d2fe13ecb.jpg
            //  https://i.pinimg.com/originals/1f/3f/ed/1f3fed6c284955934c7d724d2fe13ecb.png
            return src.replace(/i\.pinimg\.com\/[^/]*(\/.*\/[^/]*)\.[^/.]*$/, "i.pinimg.com/originals$1.jpg");
        }

        // vg-images.condecdn.net
        // gl-images.condecdn.net
        if (domain.indexOf("images.condecdn.net") >= 0) {
            return src.replace(/(\/image\/[^/]*\/).*/, "$1original/");
        }

        if (domain.indexOf("media.fromthegrapevine.com") >= 0 ||
            domain.indexOf("www.mediavillage.com") >= 0) {
            return src.replace(/\/([^/.]*\.[^/.]*)\.[^/.]*\.[^/.]*$/, "/$1");
        }

        if (domain.search(/img[0-9]*\.acsta\.net/) >= 0) {
            newsrc = src.replace(/acsta\.net\/[^/]*\/pictures\//, "acsta.net/pictures/");
            if (newsrc !== src)
                return newsrc;

            // http://fr.web.img4.acsta.net/r_640_360/videothumbnails/15/06/05/12/59/008779.jpg
            //   http://fr.web.img4.acsta.net/videothumbnails/15/06/05/12/59/008779.jpg
            // http://fr.web.img2.acsta.net/c_208_117/videothumbnails/17/02/08/14/59/169562.jpg
            //   http://fr.web.img2.acsta.net/videothumbnails/17/02/08/14/59/169562.jpg
            return src.replace(/\/[rc]_[0-9]+_[0-9]+\//, "/");
        }

        if (domain.indexOf("em.wattpad.com") >= 0) {
            return src.replace(/.*\.wattpad\.com\/[a-f0-9]*\/([a-f0-9]*).*/, "$1").replace(/([0-9A-Fa-f]{2})/g, function() {
                return String.fromCharCode(parseInt(arguments[1], 16));
            });
        }

        if (domain.indexOf("vignette.wikia.nocookie.net") >= 0) {
            // https://vignette.wikia.nocookie.net/arresteddevelopment/images/2/2a/2015_MM_and_A_TGIT_Party_-_Portia_de_Rossi.jpg/revision/latest/top-crop/width/320/height/320?cb=20151215213157
            //   https://vignette.wikia.nocookie.net/arresteddevelopment/images/2/2a/2015_MM_and_A_TGIT_Party_-_Portia_de_Rossi.jpg/revision/latest/?cb=20151215213157
            //return src.replace(/(\/images\/[^/]*\/.*)\/scale-to-width-down\/[0-9]*/, "$1");
            return src.replace(/\/revision\/latest\/.*\?/, "/revision/latest/?");
        }

        if (domain.indexOf("static.asiachan.com") >= 0) {
            return src.replace(/(\/[^/]*)\.[0-9]*(\.[0-9]*\.[^/.]*$)/, "$1.full$2");
        }

        if (domain.indexOf("pic.xiami.net") >= 0) {
            return src.replace(/@[^/]*$/, "");
        }

        // img4.c.yinyuetai.com
        if (domain.search(/img[0-9]\.c\.yinyuetai\.com/) >= 0) {
            return src.replace(/[0-9]+x[0-9]+(\.[^/.]*)$/, "0x0$1");
        }

        // it also has img7.qiyipic.com, which hosts /passport/, which doesn't work with this (mp2.qiyipic.com)
        if (domain.search(/mp[0-9]*\.qiyipic\.com/) >= 0 && src.indexOf("/passport/") < 0) {
            return src.replace(/[0-9]*_[0-9]*(\.[^/.]*)$/, "0_0$1");
        }

        if (domain.indexOf("b-ssl.duitang.com") >= 0) {
            return src.replace(/\.thumb\.[0-9]+_[0-9]+\./, ".");
        }

        // i7.vcimg.com
        if (domain.search(/i-[0-9]\.vcimg.com/) >= 0) {
            return src.replace(/\/crop\//, "/").replace(/\([0-9]+x[0-9]+\)/, "");
        }

        // pic1.zhimg.com
        if (domain.search(/pic[0-9]\.zhimg\.com/) >= 0) {
            return src.replace(/_[^/._]*(\.[^/.]*)$/, "$1");
        }

        // seems to returns 403 if 'origin' or 'referer' header is set
        if (domain.indexOf("img.hb.aicdn.com") >= 0 ||
            domain.indexOf(".upaiyun.com") >= 0) {
            // http://hbimg.b0.upaiyun.com/61a5e5496ff85c52aedb1a0b88cfa6cf2fab85b25baa4-OOfVFz_fw236
            // http://hbimg.b0.upaiyun.com/24c9187996fff6a463a6e0cf33e445a5c106f840110dad-GoXNdV_fw658
            // http://hbimg.b0.upaiyun.com/eb022d252413c843904d7929cd20efad6ce5ad1d1a13b-nuwiDc_fw236
            // http://hbimg.b0.upaiyun.com/2dee7739bd27dac4368381fc5e571fc5efffa0dc1b2530-76nu98
            // http://hbimg.b0.upaiyun.com/26f0536f7035fde61b7332a3bbf1e54bf0255c4d2d07b-gZ7snl_fw658
            return src.replace(/_[^/_]*$/, "");
            // return src.replace(/_fw[0-9]*$/, "");
        }

        if (domain.indexOf("imagev2.xmcdn.com") >= 0) {
            return src.replace(/![^/]*$/, "").replace(/(\/[^/_]*)[^/.]*(\.[^/.]*)$/, "$1$2");
        }

        if (domain.indexOf("timgmb.bdimg.com") >= 0 ||
            domain.match(/timg.*?\.baidu\.com/)) {
            // https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1490961932774&di=65b21e6bef59bf6b1f6e71f18f46008c&imgtype=0&src=http%3A%2F%2Fqcloud.dpfile.com%2Fpc%2FqqYXMqI9j2MqLzJ3hKYFqx6407skBHDx-gKkvyfBaUcZWk8eZQMRW2FeuVD9x_wbTYGVDmosZWTLal1WbWRW3A.jpg
            //   http://qcloud.dpfile.com/pc/qqYXMqI9j2MqLzJ3hKYFqx6407skBHDx-gKkvyfBaUcZWk8eZQMRW2FeuVD9x_wbTYGVDmosZWTLal1WbWRW3A.jpg
            return decodeURIComponent(src.replace(/.*\/[^/]*[?&]src=([^/&]*).*/, "$1"));
        }

        // p2.xiaohx.net
        if (domain.search(/p[0-9]*\.xiaohx\.net/) >= 0) {
            return src.replace("/thumb/", "/");
        }

        // img1.doubanio.com
        if (domain.search(/img[0-9]\.doubanio\.com/) >= 0) {
            // https://img3.doubanio.com/lpic/s26811681.jpg
            //   https://img3.doubanio.com/opic/s26811681.jpg
            // https://img3.doubanio.com/img/musician/small/24961.jpg
            //   https://img3.doubanio.com/img/musician/large/24961.jpg
            return src
                .replace(/\/(?:small|medium)\//, "/large/")
                .replace(/\/.pic\//, "/opic/");
        }

        if (domain.search(/img\.idol001\.com/) >= 0) {
            return src.replace(/^(.*?idol001\.com\/)[^/]*\//, "$1origin/");
        }

        // for media.nrj.fr
        // http://media.nrj.fr/1900x1200/2017/11/selena-gomez-et-ariana-grande_7134.jpg
        // http://media.nrj.fr/800x600/2017/12/cover-ariana-grande-jpg5981_1375899.jpg
        // http://media.nrj.fr/436x327/113-jpg_200414.jpg
        // http://media.nrj.fr/1400x1400/2017/09/guillaume-radio-podcasts-_388327.jpg
        // http://media.nrj.fr/360x270/2017/07/julien-dore_5171.jpg
        // http://media.nrj.fr/300x500/2015/08/11907170-1042189502503923-8150073793944711126-n-jpg-9164253.jpg
        // http://media.nrj.fr/160x120/2014/10/logodjbuzz-3159-1111-8790_8361.jpg
        // http://media.nrj.fr/manu69/2017/06/fugitif-paris-2.jpg
        // http://media.nrj.fr/217x326/2013/05/the-big-bang-theory-penny_9252.jpg
        // http://media.nrj.fr/200x150/2017/01/cover-kanye-west-jpg638_1351247.jpg
        // http://image-api.nrj.fr/02_5a02579e3cb49.png?w=730&h=410
        //   http://image-api.nrj.fr/02_5a02579e3cb49.png
        // http://image-api.nrj.fr/une-chance-sur-deux_5a7ad778514a1.jpg
        // http://image-api.nrj.fr/6-jobs-etudiants-qui-recrutent-en-periode-de-fetes-istock-519555835_584fb5cc450ec.jpg
        // http://players.nrjaudio.fm/live-metadata/player/img/600x/196622-202066.JPG
        // http://www.nrj.fr/img/nrjactive/orientation/motivations/relever_des_defis.jpg
        // http://cdn.nrj-platform.fr/uploads/pages/58c59bc78b042_capture-d-cran-2017-03-12--20-03-22.jpg
        // while it can be downscaled, it can't be upscaled, can't find any other pattern
        if (domain.indexOf("image-api.nrj.fr") >= 0 &&
            src.indexOf("/http/") >= 0) {
            // http://image-api.nrj.fr/http/players.nrjaudio.fm%2Flive-metadata%2Fplayer%2Fimg%2Fplayer-files%2Fnrj%2Flogos%2F640x640%2FP_logo_NRJ_wr_La_Playlist_du_jeudi_New.png?w=360&h=360
            //   http://players.nrjaudio.fm/live-metadata/player/img/player-files/nrj/logos/640x640/P_logo_NRJ_wr_La_Playlist_du_jeudi_New.png
            return "http://" + decodeURIComponent(src.replace(/.*\.nrj\.fr\/http\/([^/?&]*).*/, "$1"));
        }

        if (domain.indexOf("norwalkreflector.com") >= 0 &&
            src.indexOf("/image/") >= 0) {
            return src.replace(/(\/image\/[0-9]*\/[0-9]*\/[0-9]*\/)[^/]*\/([^/]+)$/, "$1$2");
        }

        if (domain.indexOf("assets.bwbx.io") >= 0) {
            return src.replace(/\/[0-9]*x(-[0-9]*\.[^/]*)$/, "/-1x$1");
        }

        if (domain.indexOf("file.osen.co.kr") >= 0) {
            // http://file.osen.co.kr/article_thumb/2018/01/25/201801251451774572_5a6975efc76bc_120x68.jpg
            //   http://file.osen.co.kr/article/2018/01/25/201801251451774572_5a6975efc76bc.jpg
            return src.replace("/article_thumb/", "/article/").replace(/_[0-9]+x(?:[0-9]+)?(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf("thumbnews.nateimg.co.kr") >= 0) {
            return src.replace(/.*\/view[0-9]*\//, "");
        }

        if (domain.indexOf("img.sedaily.com") >= 0) {
            return src.replace(/(\/[0-9]*)_[^/.]*(\.[^/.]*)$/, "$1$2");
        }

        if (domain === "stat.ameba.jp" ||
            domain === "stat.profile.ameba.jp") {
            return src.replace(/\/t[0-9]*_([^/]*)$/, "/o$1");
        }

        if (domain === "livedoor.blogimg.jp") {
            return src.replace(/(\/[^/.]*)-[^/.]*(\.[^/.]*)/, "$1$2");
        }

        if (domain === "image.cine21.com") {
            // http://image.cine21.com/resize/IMGDB/people/2004/0504/large/105535_spe45[H800-].jpg?H300
            //   http://image.cine21.com/IMGDB/people/2004/0504/large/105535_spe45.jpg
            // http://image.cine21.com/resize/cine21/still/2017/1213/11_39_08__5a3092cc9f638[X50,60].jpg
            //   http://image.cine21.com/cine21/still/2017/1213/11_39_08__5a3092cc9f638.jpg
            // http://image.cine21.com/resize/cine21/poster/2005/0603/M0010044_1[F230,329].jpg
            //   http://image.cine21.com/cine21/poster/2005/0603/M0010044_1.jpg
            return src
                .replace("/resize/", "/")
                .replace(/\/(?:small|medium)(\/[^/]*)$/, "/large$1")
                .replace(/\?.*$/, "")
                .replace(/\[[WH][-0-9]*\](\.[^/.]*)$/, "$1")
                .replace(/\[[XF][0-9]+,[0-9]+\](\.[^/.]*)$/, "$1");
        }

        if (domain === "cdnimg.melon.co.kr" &&
            (src.indexOf("/images/") >= 0 ||
             src.indexOf("/user_images/") >= 0)) {
            // http://cdnimg.melon.co.kr/svc/user_images/plylst/2016/12/21/56/425022806_org.jpg?tm=20171210105300/melon/resize/x262/quality/100/optimize
            //   http://cdnimg.melon.co.kr/svc/user_images/plylst/2016/12/21/56/425022806_org.jpg
            // http://cdnimg.melon.co.kr/cm/album/images/003/74/978/374978_500.jpg/melon/resize/120/quality/80/optimize
            //   http://cdnimg.melon.co.kr/cm/album/images/003/74/978/374978_org.jpg
            // http://cdnimg.melon.co.kr/cm/artistcrop/images/006/72/337/672337_500.jpg?f88c5a23497a77f68d8ac296e218db02/melon/resize/416/quality/80/optimize
            //   http://cdnimg.melon.co.kr/cm/artistcrop/images/006/72/337/672337_org.jpg

            // http://cdnimg.melon.co.kr/cm/mv/images/43/501/78/990/50178990_1_640.jpg/melon/quality/80/resize/144/optimize
            //   http://cdnimg.melon.co.kr/cm/mv/images/43/501/78/990/50178990_1_org.jpg

            // http://cdnimg.melon.co.kr/svc/images/main/imgUrl20180123110250.jpg/melon/quality/80
            //   http://cdnimg.melon.co.kr/svc/images/main/imgUrl20180123110250.jpg

            if (src.indexOf("/images/main/") >= 0) {
                return src.replace(/(images\/.*\/[^/_]*)((_[^/.]*)_)?(_?[^/._]*)?(\.[^/.]*)[?/].*$/, "$1$3$5");
            } else {
                return src.replace(/(images\/.*\/[^/_]*)((_[^/.]*)_)?(_?[^/._]*)?(\.[^/.]*)[?/].*$/, "$1$3_org$5");
            }
        }

        // itunes, is4-ssl.mzstatic.com
        if (domain.match(/is[0-9](-ssl)?\.mzstatic\.com/) &&
            src.indexOf("/image/thumb/") >= 0) {
            // https://is3-ssl.mzstatic.com/image/thumb/Music111/v4/e1/dc/68/e1dc6808-6d55-1e38-a34d-a3807d488859/191061355977.jpg/1200x630bb.jpg
            // http://is4.mzstatic.com/image/thumb/Music6/v4/4e/92/37/4e923792-948a-ae3a-dc5b-b7416c23807a/source/165x165bb.jpg
            return src.replace(/\/[0-9]*x[0-9]*[a-z]*(\.[^/.]*)$/, "/999999999x0w$1");
        }

        if (//domain.match(/sc[0-9]*\.alicdn\.com/) ||
            domain.match(/[0-9]*\.alicdn\.com/) ||
            domain === "img.alicdn.com") {
            // https://ae01.alicdn.com/kf/HTB1AMo8a4uaVKJjSZFjq6AjmpXai/BINYEAE-new-CD-seal-State-of-Grace-Paul-Schwartz-Lisbeth-Scott-CD-disc-free-shipping.jpg_640x640.jpg
            //   https://ae01.alicdn.com/kf/HTB1AMo8a4uaVKJjSZFjq6AjmpXai/BINYEAE-new-CD-seal-State-of-Grace-Paul-Schwartz-Lisbeth-Scott-CD-disc-free-shipping.jpg
            return src.replace(/_[0-9]+x[0-9]+[^/]*?$/, "");
        }

        if (domain === "thumbor.forbes.com") {
            return decodeURIComponent(src.replace(/.*\/([^/]*%3A%2F%2F[^/]*).*/, "$1"));
        }

        if (domain === "lastfm-img2.akamaized.net") {
            return src.replace(/\/i\/u\/[^/]*\//, "/i/u/");
        }

        if (domain.match(/a[0-9]-images\.myspacecdn\.com/)) {
            return src.replace(/\/[^/.]*(\.[^/.]*)$/, "/full$1");
        }

        // https://geo-media.beatport.com/image_size/250x250/e6997bab-e115-41b2-acab-3cae7bcf3615.jpg
        if (domain === "geo-media.beatport.com") {
            return src.replace(/\/image_size\/[0-9]*x[0-9]*\//, "/image_size/0x0/");
        }

        if (domain.indexOf("media.tumblr.com") > 0 &&
            !src.match(/_[0-9]*\.gif$/)) {
            // some gifs don't play properly (same case with raw?)
            // handle this?
            // https://78.media.tumblr.com/25e643db76a1e626ff4e79faa2f7bb3d/tumblr_inline_mvspvogcB51sq8rci.jpg
            // https://static.tumblr.com/2074b5c013a08663cbfe4f86f54aad99/b70lpcc/m9Vnkyvyw/tumblr_static_d04dkibmyqokwgwsgcwggkowg.jpg
            // https://static.tumblr.com/978c2da2706d61fcdc5a13083a05c70c/yffueik/n9Znvprsi/tumblr_static_bp7fdwcxpbwc8k440ksocks8c.png
            // https://static.tumblr.com/rpaguup/J6wmdtouh/tumblr_mdipupjoku1r2xx88o1_500.png
            //   http://data.tumblr.com/rpaguup/J6wmdtouh/tumblr_mdipupjoku1r2xx88o1_raw.png -- doesn't work
            // http://media.tumblr.com/tumblr_m94wh56woC1ro0opg.png
            // http://media.tumblr.com/bbeec3764efd6b63c14fe1e56f4f5b22/tumblr_inline_mn9bgayRCZ1qz4rgp.png
            // https://78.media.tumblr.com/tumblr_m2p6yiRZNR1qha0cy.gif
            // https://static.tumblr.com/ae53741763a8e9a937e587fd71c24ee5/065fclu/Okon9yxx0/tumblr_static_filename_640_v2.jpg
            // https://static.tumblr.com/9d9cb03d00947212897f5fa390615bb1/szhmsgg/PW8ok7jgi/tumblr_static_tumblr_static__640.jpg
            //
            // working gifs:
            // https://78.media.tumblr.com/4b9573a2fdd97a6e6cac771d4a0c0edd/tumblr_ntg9jreu9X1s5q5l6o4_400.gif
            //   http://data.tumblr.com/4b9573a2fdd97a6e6cac771d4a0c0edd/tumblr_ntg9jreu9X1s5q5l6o4_raw.gif
            // https://78.media.tumblr.com/e7976904bb598ed701324ee471056156/tumblr_ntg9jreu9X1s5q5l6o3_400.gif
            //   http://data.tumblr.com/e7976904bb598ed701324ee471056156/tumblr_ntg9jreu9X1s5q5l6o3_raw.gif
            if (src.match(/:\/\/[^/]*\/[0-9a-f]*\/[^/]*$/)) {
                // https://78.media.tumblr.com/3ebf4c3e175553194b3c9a0867a47719/tumblr_nugefiK7yj1u0c780o1_500.jpg
                //   http://data.tumblr.com/3ebf4c3e175553194b3c9a0867a47719/tumblr_nugefiK7yj1u0c780o1_raw.jpg
                // https://78.media.tumblr.com/96a4d0ab5a1e05ecc6f3eb638a5504a5/tumblr_oxin3qLmFS1spqhdqo7_500.jpg
                //   http://data.tumblr.com/96a4d0ab5a1e05ecc6f3eb638a5504a5/tumblr_oxin3qLmFS1spqhdqo7_raw.jpg -- width of 1400 (vs 1280)
                return src
                    .replace(/:\/\/[^/]*\/(.*)_[0-9]*(\.[^/.]*)$/, "://s3.amazonaws.com/data.tumblr.com/$1_raw$2");
            } else if (src.match(/:\/\/[^/]*\/[^/]*$/)) {
                // https://78.media.tumblr.com/tumblr_m4fhyoiFd51rqmd7mo1_500.jpg
                //   https://78.media.tumblr.com/tumblr_m4fhyoiFd51rqmd7mo1_1280.jpg
                return src.replace(/_[0-9]*(\.[^/.]*)$/, "_1280$1");
            }
        }

        if (domain === "s.booth.pm") {
            return src.replace(/\/c\/[^/]*\//, "/").replace(/(\/[^/.]*)_c_[0-9]+x[0-9]+(\.[^/.]*$)/, "$1$2");
        }

        if (domain === "wc-ahba9see.c.sakurastorage.jp" &&
            src.indexOf("/max-1200/") >= 0) {
            return src.replace(/-[0-9a-z]+(\.[^/.]*)$/, "-1200$1");
        }

        if (domain === "www.nautiljon.com" &&
            src.indexOf("/images/") >= 0) {
            return src.replace(/\/images\/[0-9]+x[0-9]+\//, "/images/").replace(/\/mini\/([^/]*)$/, "/$1");
        }

        // wall street journal:
        // A, C, D, (E,F), G, H, P, J, M
        // https://s.wsj.net/public/resources/images/BN-WV466_rotiss_A_20180103172646.jpg
        // https://s.wsj.net/public/resources/images/BN-WV466_rotiss_C_20180103172646.jpg
        // https://s.wsj.net/public/resources/images/BN-WV466_rotiss_D_20180103172646.jpg
        // https://s.wsj.net/public/resources/images/BN-WV466_rotiss_G_20180103172646.jpg
        // https://s.wsj.net/public/resources/images/BN-WV466_rotiss_M_20180103172646.jpg
        //
        // https://s.wsj.net/public/resources/images/BN-WV815_3m8WN_M_20180104143735.jpg
        // https://si.wsj.net/public/resources/images/BN-WV794_apples_M_20180104140237.jpg (s.wsj.net works too)
        //
        // doesn't support J or M:
        //
        // A, C, D, E, F, G, P
        // https://s.wsj.net/public/resources/images/OB-YL084_KoreaC_G_20130805214258.jpg
        // https://s.wsj.net/public/resources/images/OB-YL082_KoreaC_P_20130805213748.jpg
        //
        // so far it seems that P is the largest common one, but M can be larger. maybe date has something to do with it?
        //
        // other:
        // https://si.wsj.net/public/resources/images/BN-WW013_0105KO_Z120_20180104213322.jpg
        // Z120 works with "newer" urls, but not with older ones (Z0, Z100, etc. don't work)
        //
        // https://art.wsj.net/api/photos/gams-files/BN-WV826_3fHQP_A_20180104144705.jpg?width=110&height=73
        // https://s.wsj.net/public/resources/images/BN-WV826_3fHQP_A_20180104144705.jpg
        // width=0&height=0 returns a 1x1, same for width=-1&height=-1. width=8000&height=8000 results in a zoomed in image (but rather high quality nonetheless)
        // https://art.wsj.net/api/photos/gams-files/BN-WV826_3fHQP_A_20180104144705.jpg (invalid, since it requires parameters) results in:
        // {"message":"No HTTP resource was found that matches the request URI 'http://art.wsj.net/api/photos/gams-id:3fHQP/smartcrop?crophint=A'.","messageDetail":"No action was found on the controller 'PhotoApi' that matches the request."}
        // http://art.wsj.net/api/photos/gams-id:3fHQP/smartcrop
        // {"message":"No HTTP resource was found that matches the request URI 'http://art.wsj.net/api/photos/gams-id:3fHQP/smartcrop'.","messageDetail":"No action was found on the controller 'PhotoApi' that matches the request."}
        // http://art.wsj.net/api/photos/gams-id:3fHQP - works!
        //
        // https://art.wsj.net/api/photos/gams-files/BN-WV815_3m8WN_A_20180104143735.jpg?width=110&height=61
        // https://art.wsj.net/api/photos/gams-id:3m8WN
        //
        // id is base62 using 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ as the alphabet
        //
        // most don't work with this though
        //
        // https://si.wsj.net/public/resources/images/BN-KS721_GerryB_AM_20151013072049.jpg
        // M doesn't work, but P does (conversely, AM doesn't work with some old images, but seems to work with newer ones)
        // https://si.wsj.net/public/resources/images/BN-WV959_SYRDET_ER_20180104172634.jpg
        // https://s.wsj.net/public/resources/images/BN-WU361_SZA_01_D_20171229145931.jpg

        if (domain === "art.wsj.net") {
            if (src.indexOf("/api/photos/gams-files/") >= 0) {
                return src.replace(/\/gams-files\/[^-_/.]*-[^-_/.]*_([^/_.]*)_.*$/, "/gams-id:$1");
            }

            if (src.indexOf("/api/photos/gams-id:") >= 0) {
                return src.replace(/(\/gams-id:[^/]*)\/.*$/, "$1");
            }
        }

        if (domain.match(/images[0-9]*\.fanpop\.com/)) {
            // http://images6.fanpop.com/image/photos/33100000/Zetsuen-No-Tempest-zetsuen-no-tempest-33126825-2048-2970.jpg
            //   http://images6.fanpop.com/image/photos/33100000/Zetsuen-No-Tempest-zetsuen-no-tempest-33126825.jpg
            // http://images1.fanpop.com/images/image_uploads/cf-calista-flockhart-912712_525_700.jpg
            // http://images.fanpop.com/images/image_uploads/Emma-Watson--emma-watson-95242_500_400.jpg
            //
            // http://images6.fanpop.com/image/photos/38000000/Zayn-Malik-2015-one-direction-38049270-2121-2500.jpg
            //   http://images6.fanpop.com/image/photos/38000000/Zayn-Malik-2015-one-direction-38049270.jpg - doesn't work
            return src.replace(/([0-9]+)-[0-9]+-[0-9]+(\.[^/.]*)$/, "$1$2").replace(/([0-9]+)_[0-9]+_[0-9]+(\.[^/.]*)$/, "$1$2");
        }

        // https://image.jimcdn.com/app/cms/image/transf/dimension=299x10000:format=png/path/s07f3459425dd27f2/image/i23aaf7ddb2a0e16d/version/1471508912/image.png
        // https://image.jimcdn.com/app/cms/image/transf/none/path/s07f3459425dd27f2/image/i23aaf7ddb2a0e16d/version/1471508912/image.png
        // https://github.com/thumbor/thumbor/issues/564
        if (domain.indexOf(".jimcdn.com") >= 0) {
            return src.replace(/(\/app\/cms\/image\/transf\/)[^/]*\//, "$1none/");
        }

        if (domain.match(/resize[0-9]*-[a-z]*\.ladmedia\.fr/)) {
            // http://resize-parismatch.ladmedia.fr/r/625,417,center-middle,ffffff/img/var/news/storage/images/paris-match/people/meurtre-du-cousin-de-rihanna-un-suspect-en-detention-provisoire-1432127/23594795-1-fre-FR/Meurtre-du-cousin-de-Rihanna-un-suspect-en-detention-provisoire.jpg
            // http://resize1-parismatch.ladmedia.fr/r/300,300,center-middle,ffffff/img/var/news/storage/images/paris-match/people-a-z/rihanna/5971706-8-fre-FR/Rihanna.jpg
            // http://resize1-doctissimo.ladmedia.fr/r/1010,,forcex/img/var/doctissimo/storage/images/fr/www/beaute/diaporamas/coiffure-de-star-coiffures-de-stars/coiffure-ciara/2440196-1-fre-FR/Le-Tie-Dye-rate-de-Ciara.jpg
            return src.replace(/\/r\/[^/]*\//, "/");
        }

        if (domain.match(/thumbs[0-9]*\.imgbox\.com/) ||
            domain.match(/images[0-9]*\.imgbox\.com/)) {
            // https://thumbs2.imgbox.com/6b/e7/rklghXlY_t.jpg
            // https://images2.imgbox.com/6b/e7/rklghXlY_o.jpg
            return src
                .replace(/\/thumbs([0-9]*)\.imgbox\.com\//, "/images$1.imgbox.com/")
                .replace(/_t*(\.[^/.]*)/, "_o$1");
        }

        if (domain.match(/cdn\.[^.]*\.steamstatic\.com/)) {
            // http://cdn.edgecast.steamstatic.com/steam/apps/405710/ss_8555059322d118b6665f1ddde6eaa987c54b2f31.600x338.jpg?t=1516755673
            //   http://cdn.edgecast.steamstatic.com/steam/apps/405710/ss_8555059322d118b6665f1ddde6eaa987c54b2f31.jpg?t=1516755673
            // http://cdn.akamai.steamstatic.com/steam/apps/678950/ss_cd54f0430e919020ce554f6cfa8d2f3b0d062716.600x338.jpg
            //   http://cdn.akamai.steamstatic.com/steam/apps/678950/ss_cd54f0430e919020ce554f6cfa8d2f3b0d062716.jpg
            // http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/c4/c44ec2d22a0c379d697c66b05e5ca8204827ce75.jpg
            //   http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/c4/c44ec2d22a0c379d697c66b05e5ca8204827ce75_full.jpg
            if (src.indexOf("/public/images/avatars/") >= 0) {
                src = src.replace(/(?:_[^/.]*)?(\.[^/.]*)$/, "_full$1");
            }
            return src.replace(/\.[0-9]+x[0-9]+(\.[^/]*)$/, "$1");
        }

        if (domain.match(/cdn-images-[0-9]*\.medium\.com/)) {
            return src.replace(/\/max\/[^/]*\//, "/");
        }

        if (domain === "image.kpopstarz.com") {
            return src.replace(/\/thumbs\/full\/([^/]*)\/[^/]*\/[^/]*\/[^/]*\/[^/]*\/([^/]*)$/, "/thumbs/full/$1/999999/0/0/0/$2");
        }

        if (domain.match(/www[0-9]*\.pictures\.(.*\.)?zimbio\.com/) ||
            domain.match(/www[0-9]*\.pictures\.(.*\.)?stylebistro\.com/) ||
            // http://www4.pictures.livingly.com/gi/2014+Victoria+Secret+Fashion+Show+After+Party+JZONjIPnPNLl.jpg
            domain.match(/www[0-9]*\.pictures\.(.*\.)?livingly\.com/)) {
            // http://www4.pictures.zimbio.com/bg/Calista+Flockhart+2001+SAG+Awards+FuUveoCUR9_l.jpg
            // http://www4.pictures.stylebistro.com/gi/HeEXH_STdIGx.jpg
            // http://www1.pictures.gi.zimbio.com/Katy+Perry+NRJ+Music+Awards+2009+uA-QnAhT6Wul.jpg
            // x, l, m, p, s, c, t
            return src.replace(/[a-z](\.[^/.]*)$/, "x$1");
        }

        if (domain === "www.theplace2.ru") {
            // https://www.theplace2.ru/archive/calista_flockhart/img/calista611924_s.jpg
            //   https://www.theplace2.ru/archive/calista_flockhart/img/calista611924.jpg
            return src.replace(/_[a-z](\.[^/.]*)$/, "$1");
        }

        if (domain.match(/cdn[0-9]-www\.craveonline\.com/)) {
            // http://cdn2-www.craveonline.com/assets/uploads/gallery/portia-de-rossi-has-arrested-development-mandatory/thumbs/thumbs_portiaderossihotpictures13.jpg
            return src.replace("/thumbs/thumbs_", "/");
        }

        if (domain.match(/img[0-9]*\.telestar\.fr/)) {
            // https://img1.telestar.fr/var/telestar/storage/images/2/9/0/290401/1732584-1/Calista-Flockhart-dans-la-serie-Ally-McBeal-en-1997_width1024.jpg
            //   https://img1.telestar.fr/var/telestar/storage/images/2/9/0/290401/1732584-1/Calista-Flockhart-dans-la-serie-Ally-McBeal-en-1997.jpg
            return src.replace(/_width[0-9]*(\.[^/.]*)$/, "$1");
        }

        if (domain.match("static.tvgcdn.net")) {
            // http://static.tvgcdn.net/mediabin/galleries/shows/a_f/bq_bz/brothersandsisters/season3/smallcrops/brothers-sisters282sm.jpg
            //   http://static.tvgcdn.net/mediabin/galleries/shows/a_f/bq_bz/brothersandsisters/season3/brothers-sisters282.jpg
            // http://static.tvgcdn.net/mediabin/showcards/celebs/d-f/thumbs/felicity-jones_768x1024.png
            //   http://static.tvgcdn.net/mediabin/showcards/celebs/d-f/felicity-jones.png
            // return src.replace(/\/thumbs\/([^/.]*)_[0-9]+x[0-9]+(\.[^/.]*)$/, "/$1$2");
            return src
                .replace("/smallcrops/", "/")
                .replace("/thumbs/", "/")
                .replace(/sm(\.[^/.]*)$/, "$1")
                .replace(/_[0-9]+x[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf(".blogcdn.com") >= 0) {
            // https://s.blogcdn.com/slideshows/images/slides/506/163/7/S5061637/slug/l/selena-gomez-visits-the-elvis-duran-z100-morning-show-1.jpg
            // http://www.blogcdn.com/slideshows/images/slides/289/321/4/S2893214/slug/l/2013-american-music-awards-arrivals-1.jpg
            // http://www.blogcdn.com/slideshows/images/slides/289/305/8/S2893058/slug/l/2014-mtv-video-music-awards-arrivals-1.jpg
            // only found /slug/s and /slug/l so far, tried a-z
            return src.replace(/\/slug\/[a-z]\//, "/slug/l/");
        }

        if (domain === "photos.imageevent.com") {
            // http://photos.imageevent.com/afap/wallpapers/stars/bellathorne/icons/Bella%20Thorne%20and%20Zendaya%20Coleman.jpg
            return src.replace(/\/icons\/([^/]*)$/, "/$1");
        }

        if (domain === "image.ajunews.com") {
            // http://image.ajunews.com//content/image/2015/10/10/20151010181219457255_258_161.jpg
            //   http://image.ajunews.com//content/image/2015/10/10/20151010181219457255.jpg
            return src.replace(/_[0-9]*_[0-9]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "www.telegraph.co.uk" ||
            // https://secure.aws.telegraph.co.uk/content/dam/wellbeing/2016/12/28/graham5_trans_NvBQzQNjv4BqNyaloxhBNUSEitvcqmzeaNrVK9LoR4c_wZH1EhIay9c.jpg?imwidth=480
            domain.indexOf("aws.telegraph.co.uk") >= 0 ||
            domain === "subscriber.telegraph.co.uk") {
            // http://www.telegraph.co.uk/content/dam/men/2016/02/26/Headerraz-small_trans_NvBQzQNjv4BqqVzuuqpFlyLIwiB6NTmJwfSVWeZ_vEN7c6bHu2jJnT8.jpg
            //       http://www.telegraph.co.uk/content/dam/men/2016/02/26/Headerraz_trans_NvBQzQNjv4BqqVzuuqpFlyLIwiB6NTmJwfSVWeZ_vEN7c6bHu2jJnT8.jpg
            // http://www.telegraph.co.uk/content/dam/luxury/2018/01/17/018_MM4_9844-large_trans_NvBQzQNjv4BqeqwG1mMdY8c_ukC_8VAhqgb1Y9UHRh9-1rvsHveO7k8.JPG
            //       http://www.telegraph.co.uk/content/dam/luxury/2018/01/17/018_MM4_9844_trans_NvBQzQNjv4BqeqwG1mMdY8c_ukC_8VAhqgb1Y9UHRh9-1rvsHveO7k8.JPG
            // http://www.telegraph.co.uk/content/dam/Author%20photos/Martin%20byline-small.png
            //       http://www.telegraph.co.uk/content/dam/Author%20photos/Martin%20byline.png
            // http://www.telegraph.co.uk/content/dam/fashion/2016/10/11/110910109_ONLINE_USE_ONLY_ONE_USE_ONLY_MUST_CREDIT_Alexi_Lubomirski_-_Harpers__Bazaar_US__MUST_HOTLI_trans_NvBQzQNjv4BqqVzuuqpFlyLIwiB6NTmJwfSVWeZ_vEN7c6bHu2jJnT8.jpg
            // http://www.telegraph.co.uk/content/dam/Travel/Cruise/titanic-1997-film-still-ship-xlarge.jpg
            //        http://www.telegraph.co.uk/content/dam/Travel/Cruise/titanic-1997-film-still-ship.jpg
            //return src.replace(/(\/[^/-]*[^-_])-(?:x*(?:large|medium|small))(_[^/]*)?(\.[^/.]*$)$/, "$1$2$3");
            return src.replace(/-(?:x*(?:large|medium|small))(_[^/]*)?(\.[^/.]*$)$/, "$1$2");
        }

        if (domain === "i.telegraph.co.uk" ||
            domain === "secure.i.telegraph.co.uk") {
            // works:
            // http://i.telegraph.co.uk/multimedia/archive/03218/Hogwarts_3218917c.jpg
            // k, a, m, i, b, n, l, c, d, e, f, g, o, p, j, h
            // doesn't work:
            // http://i.telegraph.co.uk/multimedia/archive/02804/Felicity-Jones_2804773c.jpg
            // n, b, i, l, d, c, a, f, g, o, p, j, h
            // doesn't work:
            // https://secure.i.telegraph.co.uk/multimedia/archive/03443/London-Connections_3443046a.jpg
            //
            // https://i.telegraph.co.uk/multimedia/archive/03049/night-tube-full_3049237a.jpg
            //   https://i.telegraph.co.uk/multimedia/archive/03049/night-tube-full_3049237a.jpg - smaller
            //return src.replace(/[a-z](\.[^/.]*)$/, "k$1");
        }

        if (domain === "image.munhwa.com") {
            // http://image.munhwa.com/gen_thumb/201605/20160510MW162123225413_120.jpg
            //    http://image.munhwa.com/gen_news/201605/20160510MW162123225413_b.jpg
            // http://image.munhwa.com/gen_news/201708/2017081701032603000001_b.jpg
            // http://marathon.munhwa.com/munhwa_anyadmin/amboard/imgview.php?no=785&fno=23996&group=basic&code=gallery - very large
            //   http://marathon.munhwa.com/netizen/index02.php?sno=60&group=basic&code=gallery&category=&&abmode=view&no=23996&bsort=&bfsort=&PHPSESSID=91245c6b3debc2a851d802574460ea78 - article
            return src.replace("/gen_thumb/", "/gen_news/").replace(/_[^/._]*(\.[^/.]*$)/, "_b$1");
        }

        if (domain.indexOf(".dspmedia.co.kr") >= 0) {
            // http://kara.dspmedia.co.kr/data/file/karam41/thumb_125x215_100/1935537395_3AVlZGS5__YS_1284.jpg
            //   http://kara.dspmedia.co.kr/data/file/karam41/1935537395_3AVlZGS5__YS_1284.jpg
            return src.replace(/(\/file\/[^/]*\/)thumb_[0-9]*x[0-9]*[^/]*\//, "$1");
        }

        if (domain.indexOf("static.wixstatic.com") >= 0) {
            // https://static.wixstatic.com/media/c30de2_5bb577f8c9f949178994f77b47f5eb27~mv2_d_1500_2250_s_2.jpg/v1/fill/w_241,h_378,al_c,q_80,usm_0.66_1.00_0.01/c30de2_5bb577f8c9f949178994f77b47f5eb27~mv2_d_1500_2250_s_2.webp
            //   https://static.wixstatic.com/media/c30de2_5bb577f8c9f949178994f77b47f5eb27~mv2_d_1500_2250_s_2.jpg
            // http://static.wixstatic.com/media/140a90_5b3fa9eb4568eac9b3d5e79cf37525d0.jpg_512
            //   http://static.wixstatic.com/media/140a90_5b3fa9eb4568eac9b3d5e79cf37525d0.jpg
            return src
                .replace(/(\.[^/.]*)\/v1\/.*/, "$1")
                .replace(/_[0-9]*$/, "");
        }

        if (domain.indexOf(".kukinews.com") >= 0 ||
            domain === "www.inews365.com" ||
            // http://www.newsinstar.com/data/cache/public/photos/20180309/art_15200463472991_6c6a6f_90x60_c0.jpg
            //   http://www.newsinstar.com/data/photos/20180309/art_15200463472991_6c6a6f.jpg
            domain === "www.newsinstar.com" ||
            domain === "www.ddaily.co.kr") {
            // http://www.inews365.com/data/cache/public/photos/20180205/art_15174759398393_648x365.jpg
            //   http://www.inews365.com/data/photos/20180205/art_15174723165416.jpg
            // http://www.ddaily.co.kr/data/cache/public/photos/cdn/20180205/art_1517533165_58x58.jpg
            // http://cdn.kukinews.com/data/cache/public/photos/cdn/20180104/art_1516601165_300x190.jpg
            //   http://cdn.kukinews.com/data/photos/cdn/20180104/art_1516601165.jpg
            // http://news.kukinews.com/data/cache/public/photos/20180119/art_1516353322_300x190.jpg
            //   http://news.kukinews.com/data/photos/20180119/art_1516353322.jpg
            // http://cdn.kukinews.com/data/photos/kukiArticle/2011/0719/2011071901.jpg - 3594x2202
            // http://m.kukinews.com/data/photos/kukiArticle/2013/0527/09251832521234.jpg - 4636x2891
            // http://cdn.kukinews.com/data/photos/kukiArticle/2013/1208/contax_34.jpg
            return src.replace(/\/data\/cache\/public\//, "/data/").replace(/_[0-9]+x[0-9]+(?:_c[0-9]*)?\.([^/.]*)/, ".$1");
        }

        // wip
        // http://cdn.emetro.co.kr/html/image_view.php?f=20180116000114.jpg&x=175&y=120&b=0&p=tl&ds=320
        //   http://cdn.emetro.co.kr/imagebank/2018/01/16/0480/20180116000114.jpg - 480 pixels (/0480/), removing doesn't work, but replacing with 0320, 0640, 1024 works (image is 568x329)
        // http://cdn.emetro.co.kr/html/image_view.php?f=20180123000084.jpg&x=263&y=230&b=20&p=tc&ds=100000
        //   http://cdn.emetro.co.kr/imagebank/2018/01/23/0320/20180123000047.jpg - 320 pixels
        // http://cdn.emetro.co.kr/html/image_view.php?f=20180123000037.jpg&x=122&y=105&b=0&p=tc&ds=1024
        //   http://cdn.emetro.co.kr/imagebank/2018/01/23/0640/20180123000037.jpg
        // http://cdn.emetro.co.kr/html/image_view_maxw.php?f=20180207000150.jpg&x=640&ds=640
        //   http://cdn.emetro.co.kr/html/image_view_maxw.php?f=20180207000150.jpg&x=9999&ds=9999
        //   http://cdn.emetro.co.kr/html/image_view_maxw.php?f=20180207000150.jpg&x=9999999999&ds=9999999999
        //
        // p: position (tl = top left, tc = top center?, etc.), optional
        // d: quality? the higher it is, the less blurry it is, optional
        // b: no idea, optional
        // x, y: required, 0 doesn't work (blank page), -1 returns a 10x10? image, 1 returns 1px, larger stretches it
        if (domain === "cdn.emetro.co.kr") {
            return src
                .replace(/\/image_view\.php.*?[?&]f=([^&]*).*/, "/image_view_maxw.php?f=$1&x=9999999999&ds=9999999999")
                .replace(/\/imagebank\/[0-9]*\/[0-9]*\/[0-9]*\/[0-9]*\/([^/]*)$/, "/html/image_view_maxw.php?f=$1&x=9999999999&ds=9999999999")
                .replace(/\/image_view_maxw.php.*?[?&]f=([^&]*).*/, "/image_view_maxw.php?f=$1&x=9999999999&ds=9999999999");
            /*origsize = src.match(/\/([0-9]*)\/[^/]*$/);
            if (origsize) {
                size = parseInt(origsize[1], 10);
                if (size < 1024) {
                    return src.replace(/\/[0-9]*(\/[^/]*)$/, "/1024$1");
                }
            }*/
        }

        if (domain === "50.7.164.242:8182") {
            // http://50.7.164.242:8182/i/05/00355/qpjey5skv52d_t.jpg
            //   http://50.7.164.242:8182/i/05/00355/qpjey5skv52d.jpg
            return src.replace(/(\/i\/.*\/[^/.]*)_t(\.[^/.]*)$/, "$1$2");
        }

        if (domain.match(/img[0-9]*\.imagetwist\.com/)) {
            // http://img64.imagetwist.com/th/20956/qfucojvzag41.jpg
            //   http://img64.imagetwist.com/i/20956/qfucojvzag41.jpg
            return src.replace(/\/th\//, "/i/");
        }

        if (domain === "www.theactuary.com") {
            // http://www.theactuary.com/EasysiteWeb/getresource.axd?AssetID=552225&type=custom&servicetype=Inline&customSizeId=104
            //   http://www.theactuary.com/EasysiteWeb/getresource.axd?AssetID=552225
            return src.replace(/getresource\.axd\?.*(AssetID=[0-9]*).*/, "getresource.axd?$1");
        }

        if (domain === "static.new-magazine.co.uk") {
            // https://static.new-magazine.co.uk/prod/media/images/300x200_ct/1105261_334919_157_106_2_b4536ad77d2a7ac6c5c342d5ba94c83a.jpg
            //   https://static.new-magazine.co.uk/prod/media/images/625x833_ct/1105261_334919_157_106_2_b4536ad77d2a7ac6c5c342d5ba94c83a.jpg
            //   https://static.new-magazine.co.uk/prod/media/images/original/1105261_334919_157_106_2_b4536ad77d2a7ac6c5c342d5ba94c83a.jpg
            return src.replace(/(\/prod\/media\/images\/)[^/]*\//, "$1original/");
        }

        if (domain === "www.irishexaminer.com") {
            // removing ?.* entirely returns 500
            // https://www.irishexaminer.com/remote/image.assets.pressassociation.io/v2/image/production/144492a205ad478ef0233c59e6617054Y29udGVudHNlYXJjaCwxNTEzMDczMTc2/2.30748323.jpg?crop=0,102,3712,2190&ext=.jpg&width=600
            //   https://www.irishexaminer.com/remote/image.assets.pressassociation.io/v2/image/production/144492a205ad478ef0233c59e6617054Y29udGVudHNlYXJjaCwxNTEzMDczMTc2/2.30748323.jpg?ext=.jpg&width=600
            // however, /remote/ is a remote address
            //   http://image.assets.pressassociation.io/v2/image/production/144492a205ad478ef0233c59e6617054Y29udGVudHNlYXJjaCwxNTEzMDczMTc2/2.30748323.jpg
            return src.replace(/.*www\.irishexaminer\.com\/remote\/([^?]*).*/, "http://$1");
        }

        if (domain === "tellymix-spykawebgroup.netdna-ssl.com" &&
            src.indexOf("tellymix-spykawebgroup.netdna-ssl.com/ts/") >= 0) {
            // https://tellymix-spykawebgroup.netdna-ssl.com/ts/800/450/tellymix-spykawebgroup.netdna-ssl.com/wp-content/uploads/2016/10/the-apprentice-2016-sugar.jpg
            //   http://tellymix-spykawebgroup.netdna-ssl.com/wp-content/uploads/2016/10/the-apprentice-2016-sugar.jpg
            return src.replace(/.*tellymix-spykawebgroup\.netdna-ssl\.com\/ts\/[0-9]*\/[0-9]*\//, "http://");
        }

        if (domain === "assets.goodhousekeeping.co.uk") {
            // http://assets.goodhousekeeping.co.uk/main/embedded/37045/nick_hewer__large.jpg?20170224112427
            //   http://assets.goodhousekeeping.co.uk/main/embedded/37045/nick_hewer.jpg?20170224112427
            // http://assets.goodhousekeeping.co.uk/main/embedded/37045/scams_2__medium.jpg
            //   http://assets.goodhousekeeping.co.uk/main/embedded/37045/scams_2.jpg
            // http://assets.goodhousekeeping.co.uk/main/embedded/961/DH-esther-rantzen-170913-de__medium.jpg
            //   // http://assets.goodhousekeeping.co.uk/main/embedded/961/DH-esther-rantzen-170913-de.jpg
            //
            // doesn't work:
            // http://assets.goodhousekeeping.co.uk/main/options/sized-good-housekeeping-institute-cookery-school-outside-institute__medium.jpg
            return src.replace(/(\/embedded\/(?:[0-9]*\/)[^/]*)__[^/.]*(\.[^/]*)$/, "$1$2");
        }

        if ((domain === "www.femalefirst.co.uk" ||
             domain === "www.malextra.com") &&
            src.indexOf("/image-library/") >= 0) {
            // wip, need a better way to find numbers ... seems to stretch the image
            // http://www.femalefirst.co.uk/image-library/square/1000/n/nick-hewer.jpg.pagespeed.ce.hpbDLhN-Bn.jpg
            //   http://www.femalefirst.co.uk/image-library/square/1000/n/nick-hewer.jpg
            // http://www.femalefirst.co.uk/image-library/square/250/i/125x125xi-am-health-ledger.jpg.pagespeed.ic.FlFI8UcEzf.webp
            //   http://www.femalefirst.co.uk/image-library/square/250/i/i-am-health-ledger.jpg
            // http://www.femalefirst.co.uk/image-library/partners/bang/land/1000/b/xbruno-mars-bdb9ea9c22850bc313ff7ac8e630fb1d828ffc4f.jpg.pagespeed.ic.rBtqQphklp.jpg
            //   http://www.femalefirst.co.uk/image-library/partners/bang/land/1000/b/bruno-mars-bdb9ea9c22850bc313ff7ac8e630fb1d828ffc4f.jpg
            // http://www.femalefirst.co.uk/image-library/partners/bang/square/250/l/lord-alan-sugar-d9c582eb51a37f070569b849b1ec3916e0bb28e0.jpg
            //   http://www.femalefirst.co.uk/image-library/partners/bang/square/1000/l/lord-alan-sugar-d9c582eb51a37f070569b849b1ec3916e0bb28e0.jpg -- stretched
            // http://www.femalefirst.co.uk/image-library/deluxe/d/despicable-me-3-character-poster-5.jpg (4050x6000)
            // http://www.femalefirst.co.uk/image-library/deluxe/r/real-housewives-of-beverly-hills-season-8-camille-grammer-deluxe-image.jpg (2249x3000)
            // http://www.femalefirst.co.uk/image-library/deluxe/w/world-of-warcraft-battle-for-azeroth-logo-deluxe.jpg (4500x2400)
            //return src.replace(/\/(?:[0-9]+x[0-9]+x)?x*([^/.]*\.[^/.]*)[^/]*$/, "/$1");
            src = src.replace(/\/[0-9x]*([^/.]*\.[^/.]*)[^/]*$/, "/$1");
            origsize = src.match(/\/([0-9]*)\/.\/[^/]*$/);
            if (origsize) {
                size = origsize[1];
                if (parseInt(size, 10) < 1000) {
                    src = src.replace(/\/[0-9]*(\/.\/[^/]*)$/, "/1000$1");
                }
            }
            return src;
        }

        if (domain === "img.buzzfeed.com") {
            // wip
            // https://img.buzzfeed.com/buzzfeed-static/static/2014-11/19/17/enhanced/webdr10/longform-original-17700-1416435430-4.png
            // https://img.buzzfeed.com/buzzfeed-static/static/2014-11/19/17/campaign_images/webdr03/nick-hewer-has-just-done-his-best-ever-facial-exp-2-32167-1416437197-0_dblbig.jpg
            // https://img.buzzfeed.com/buzzfeed-static/static/2018-01/26/9/campaign_images/buzzfeed-prod-fastlane-03/the-us-olympic-committee-demands-all-usa-gymnasti-2-2591-1516975268-0_dblwide.jpg
            // https://img.buzzfeed.com/buzzfeed-static/static/2018-01/26/8/campaign_images/buzzfeed-prod-fastlane-01/the-supreme-court-stopped-alabama-from-executing--2-14117-1516973637-0_dblwide.jpg
            //   https://img.buzzfeed.com/buzzfeed-static/static/2018-01/25/22/asset/buzzfeed-prod-fastlane-02/sub-buzz-5552-1516935824-2.jpg -- unrelated?
            // https://img.buzzfeed.com/buzzfeed-static/static/2016-05/12/16/enhanced/webdr08/original-6479-1463084088-1.jpg
            // https://img.buzzfeed.com/buzzfeed-static/static/2017-08/22/15/enhanced/buzzfeed-prod-fastlane-01/original-18338-1503431220-9.png
            return src
                .replace(/_big(\.[^/.]*)$/, "_dblbig$1")
                .replace(/_wide(\.[^/.]*)$/, "_dblbig$1")
                .replace(/_dblwide(\.[^/.]*)$/, "_dblbig$1");
        }

        if (domain === "www.thegenealogist.co.uk") {
            // https://www.thegenealogist.co.uk/images/featuredarticles/header_sm/wdytya2016_dyer.jpg
            //   https://www.thegenealogist.co.uk/images/featuredarticles/header_lg/wdytya2016_dyer.jpg
            return src.replace("/images/featuredarticles/header_sm/", "/images/featuredarticles/header_lg/");
        }

        if (domain === "251d2191a60056d6ba74-1671eccf3a0275494885881efb0852a4.ssl.cf1.rackcdn.com") {
            // https://251d2191a60056d6ba74-1671eccf3a0275494885881efb0852a4.ssl.cf1.rackcdn.com/11860912_countdowns-nick-hewer-amstrad-should_6d456945_m.jpg?bg=7C7374
            //   https://251d2191a60056d6ba74-1671eccf3a0275494885881efb0852a4.ssl.cf1.rackcdn.com/11860912_countdowns-nick-hewer-amstrad-should_6d456945.jpg
            return src.replace(/(\/[^/.]*)_[a-z](\.[^/.?]*)(?:\?[^/]*)?$/, "$1$2");
        }

        if (// https://cdn.heatworld.com/one/lifestyle-legacy/fc/e7794/f8a77/be88e/964ad/02b2a/6e7bd/claude-littner_940x526.jpg
            //   https://cdn.heatworld.com/one/lifestyle-legacy/fc/e7794/f8a77/be88e/964ad/02b2a/6e7bd/claude-littner.jpg
            domain === "cdn.heatworld.com" ||
            // http://www.sohobluesgallery.com/mm5/graphics/00000001/Rolling_Stones_Keith_Richards_Guitar_God_475x705.jpg
            //   http://www.sohobluesgallery.com/mm5/graphics/00000001/Rolling_Stones_Keith_Richards_Guitar_God.jpg
            domain === "www.sohobluesgallery.com" ||
            // https://i.vimeocdn.com/video/530332183_780x439.jpg
            domain === "i.vimeocdn.com" ||
            // https://media.indiatimes.in/media/content/2018/Feb/arun_jaitley_allocates_rs_1200_crore_to_promote_bamboo_cultivation_1517487222_100x150.jpg
            domain === "media.indiatimes.in" ||
            // https://vcdn-ione.vnecdn.net/2018/02/04/topoppp-1681-1517742371_500x300.jpg
            domain === "vcdn-ione.vnecdn.net" ||
            // https://www.bangkokpost.com/media/content/20180126/c1_1401970_180126042828_620x413.jpg
            domain === "www.bangkokpost.com" ||
            // https://media2.mensxp.com/media/content/2018/Feb/congress-takes-digs-at-bjp-and-pm-modi-with-a-valentines-day-video-1400x653-1518681640_401x187.jpg
            domain.match(/media[0-9]*\.mensxp\.com/) ||
            // http://221.132.38.109/nvdata/uploads/thumbnail/2017/12/01/baogiohetbatlucnhintremamnonbibaohanh_20171201151535_220x124.jpg
            domain === "221.132.38.109" ||
            // https://i-ngoisao.vnecdn.net/2012/11/26/10-585669-1376858787_500x0.jpg
            domain === "i-ngoisao.vnecdn.net" ||
            // http://images.cinefil.com/movies/1053952_1600x450.jpg
            //   http://images.cinefil.com/movies/1053952.jpg
            domain === "images.cinefil.com") {
            newsrc = src.replace(/_[0-9]+x[0-9]+(\.[^/.]*)$/, "$1");
            if (newsrc !== src)
                return newsrc;
        }

        if (domain === "cdn.shopify.com") {
            // https://cdn.shopify.com/s/files/1/0947/6410/products/a2178934757_10_1024x1024.jpeg?v=1458824230
            //   https://cdn.shopify.com/s/files/1/0947/6410/products/a2178934757_10.jpeg?v=1458824230
            // https://cdn.shopify.com/s/files/1/0947/6410/products/Om-Sweet-Om_1024x1024.png?v=1450196316
            //   https://cdn.shopify.com/s/files/1/0947/6410/products/Om-Sweet-Om.png?v=1450196316
            // https://cdn.shopify.com/s/files/1/2220/9229/products/Siticker_laptop_image_2048x.jpg
            //   https://cdn.shopify.com/s/files/1/2220/9229/products/Siticker_laptop_image.jpg
            // https://cdn.shopify.com/s/files/1/0846/3086/products/DM21_copy2_large.jpg?v=1464040850
            //   https://cdn.shopify.com/s/files/1/0846/3086/products/DM21_copy2.jpg?v=1464040850
            // http://cdn.shopify.com/s/files/1/0683/4117/products/IMG_6727_grande.jpg?v=1514569448
            //   https://cdn.shopify.com/s/files/1/0683/4117/products/IMG_6727.jpg?v=1514569448
            return src.replace(/_(?:large|medium|small|grande|[0-9]+x(?:[0-9]+)?)(\.[^/.]*)$/, "$1");
        }

        if (domain === "cdn.itv.com") {
            // https://cdn.itv.com/uploads/editor/medium_DyTW1moFnODLSb6a6IiBigbhufrsOXe2y3XWw1ekUN8.jpg
            //   https://cdn.itv.com/uploads/editor/DyTW1moFnODLSb6a6IiBigbhufrsOXe2y3XWw1ekUN8.jpg
            return src.replace(/\/[a-z]*_([^/_]*)$/, "/$1");
        }

        if (domain === "d3mkh5naggjddw.cloudfront.net" ||
            domain === "img.blvds.com" ||
            domain.match(/t[0-9]*\.genius\.com/)) {
            // https://d3mkh5naggjddw.cloudfront.net/unsafe/smart/filters:format(jpeg)/http%3A%2F%2Fi.dailymail.co.uk%2Fi%2Fpix%2F2017%2F08%2F10%2F19%2F43248C1D00000578-0-image-a-10_1502389640540.jpg
            //   http://i.dailymail.co.uk/i/pix/2017/08/10/19/43248C1D00000578-0-image-a-10_1502389640540.jpg
            // https://t2.genius.com/unsafe/220x0/https%3A%2F%2Fimages.genius.com%2F4e99624bb74700cf1a5ac40f142cb7cf.1000x1000x1.jpg
            //   https://images.genius.com/4e99624bb74700cf1a5ac40f142cb7cf.1000x1000x1.jpg
            // https://img.blvds.com/unsafe/fit-in/smart/https://res.cloudinary.com/hynomj8e0/image/upload/v1487089435/ajb3zxdwskxppk9ih7fi.jpg
            return decodeURIComponent(src
                                      .replace(/.*\/unsafe\/smart\/[^/]*\//, "")
                                      .replace(/.*\/unsafe\/fit-in\/smart\//, "")
                                      .replace(/.*\/unsafe\/[0-9]*x[0-9]*\//, ""));
        }

        if (domain === "external.xx.fbcdn.net" && src.indexOf("safe_image.php") >= 0) {
            // https://external.xx.fbcdn.net/safe_image.php?d=AQAWoxh_q3ft0f3S&w=130&h=130&url=https%3A%2F%2Fi2.wp.com%2Fblog.native-instruments.com%2Fwp-content%2Fuploads%2F2018%2F01%2Fnative-summit-at-namm-collaborating-on-the-future-of-sound-hero.jpg%3Ffit%3D1920%252C880%26ssl%3D1&cfs=1&sx=257&sy=0&sw=880&sh=880&_nc_hash=AQCDl7GN-wkuS3BX
            //   http://blog.native-instruments.com/wp-content/uploads/2018/01/native-summit-at-namm-collaborating-on-the-future-of-sound-hero.jpg
            return decodeURIComponent(src.replace(/.*safe_image\.php.*?[?&]url=([^&]*).*/, "$1"));
        }

        if (domain === "elsewhere.scdn3.secure.raxcdn.com") {
            // seems to be the number of pixels??
            // https://elsewhere.scdn3.secure.raxcdn.com/images/v95000/articles/the-rolling-stones-2013-glastonbury-festival-35.jpg
            //   https://elsewhere.scdn3.secure.raxcdn.com/images/v9999999999999/articles/the-rolling-stones-2013-glastonbury-festival-35.jpg
            return src.replace(/\/images\/v[0-9]*\//, "/images/v999999999999999999/");
        }

        if (domain === "static01.nyt.com") {
            // https://static01.nyt.com/images/2015/08/30/arts/30RICHARDSJP5/30RICHARSJP5-superJumbo.jpg
            // https://static01.nyt.com/images/2015/09/17/arts/17KEITH/17KEITH-jumbo.jpg
            // https://static01.nyt.com/images/2015/09/17/arts/17KEITH/17KEITH-thumbStandard.jpg
            // https://static01.nyt.com/images/2015/08/30/arts/30RICHARDS1/30RICHARDS1-master1050.jpg
            // https://static01.nyt.com/images/2015/08/30/arts/30RICHARDSSUB4/30RICHARDSSUB4-master675.jpg
            // https://static01.nyt.com/images/2018/02/03/arts/03playlist/merlin_123145877_5ed2acde-72d5-4afb-a19a-93dbc29b5d2f-superJumbo.jpg?quality=100&auto=webp
            // https://static01.nyt.com/newsgraphics/2018/02/11/mens-slopestyle/assets/images/composite-2-2000_x2.jpg (4000x2058)
            // https://static01.nyt.com/images/2018/02/23/nyregion/23WOMEN01/merlin_134412716_f1cbfeaa-8204-41b1-9576-8cc8c5063348-threeByTwoLargeAt2X.jpg (3600x2400)
            // https://static01.nyt.com/newsgraphics/2014/09/24/private-lives/assets/private_lives_nilsen_1400_v1.png
            // https://static01.nyt.com/packages/flash/Lens/2011/06/20110629-KM-Weiwei/012-20110629-KM-Weiwei.JPG (4193x3307)
            // https://static01.nyt.com/images/2018/02/23/us/politics/23dc-note/merlin_134350481_6712d7ba-b262-4d9e-97f3-8094cc9de088-threeByTwoLargeAt2X.jpg
            // https://static01.nyt.com/newsgraphics/2017/10/31/yellen-legacy/50c5752d6294e63077f7e841ccf62b880fd1599e/yellen-office-alt-1.jpg (5472x3648)
            // https://static01.nyt.com/packages/flash/Lens/2010/10/20101025-NK-Joao/20101025-Joao-extra4.jpg (3200x2108)
            // https://static01.nyt.com/images/2010/10/06/nyregion/20101006Nocturnalist/20101006Nocturnalist-custom1.jpg (5120x3413)
            // https://static01.nyt.com/images/2010/10/06/nyregion/20101006Nocturnalist/20101006Nocturnalist-custom2.jpg ^
            // https://static01.nyt.com/images/2009/02/08/sports/20090209-SIOUX-S.JPG
            // https://static01.nyt.com/images/2010/01/05/arts/supperbig2.jpg (3000x2000)
            //
            // doesn't work:
            // https://static01.nyt.com/images/2010/10/24/arts/RICHARDS-Jp-1/RICHARDS-Jp-1-popup.jpg
            // https://static01.nyt.com/images/2011/11/17/fashion/17felicityspan/17felicityspan-jumbo.jpg
            var matched = src.match(/-([^/.]*)\.[^/.]*$/);
            if (matched) {
                console.log(matched[1]);
                if (matched[1] === "jumbo" ||
                    matched[1] === "thumbStandard" ||
                    matched[1].slice(0, 6) === "master") {
                    return src.replace(/-[^/.]*(\.[^/.]*)$/, "-superJumbo$1");
                }
            }
        }

        if (domain === "render.fineartamerica.com") {
            // https://render.fineartamerica.com/images/rendered/search/print/images-medium-5/keith-richards-andre-koekemoer.jpg
            //   https://images.fineartamerica.com/images-medium-large-5/keith-richards-andre-koekemoer.jpg
            return src.replace(/render\.fineartamerica\.com\/images\/rendered\/search\/print\/[^/]*(-[0-9]*)\/([^/]*)$/, "images.fineartamerica.com/images-medium-large$1/$2");
        }

        if (domain === "media.npr.org") {
            // https://media.npr.org/assets/artslife/arts/2010/10/keith-richards/keith-richards-730d749c083f177cc443b4114ee1b19b1e257988-s400-c85.jpg
            //   https://media.npr.org/assets/artslife/arts/2010/10/keith-richards/keith-richards-730d749c083f177cc443b4114ee1b19b1e257988.jpg
            return src.replace(/(\/[^/]*)-[sc][0-9]*(?:-[sc][0-9]*)?(\.[^/.]*)/, "$1$2");
        }

        if (domain.match(/rs[0-9]*\.pbsrc\.com/)) {
            // http://rs375.pbsrc.com/albums/oo198/ZaraTTucker/Get%20Italian%20Translation%20Services%20to%20Boost_zpsms99llho.jpg~c400
            //   http://i375.photobucket.com/albums/oo198/ZaraTTucker/Get%20Italian%20Translation%20Services%20to%20Boost_zpsms99llho.jpg
            // http://i843.photobucket.com/albums/zz352/loaloauk/dlp%20encounter/New%20Album%2042/4640363830_9e9c2ae51b_z.jpg~original
            return src.replace(/rs([0-9]*)\.pbsrc\.com/, "i$1.photobucket.com").replace(/~[^/.]*$/, "~original");
        }

        if (domain === "www.welt.de") {
            // https://www.welt.de/img/kultur/pop/mobile132505066/0972501497-ci102l-w1024/Keith-Richards-mit-Enkel-Otto.jpg
            //   https://www.welt.de/img/kultur/pop/mobile132505066/0972501497-ci102l-w0/Keith-Richards-mit-Enkel-Otto.jpg
            return src.replace(/-w[0-9]*(\/[^/]*)$/, "-w0$1");
        }

        if (domain === "cdn.baeblemusic.com") {
            // https://cdn.baeblemusic.com/images/bblog/5-8-2017/keith-richards-almost-died-580.jpg
            return src.replace(/-[0-9]*(\.[^/.]*)$/, "$1");
        }

        if (domain.match(/t[0-9]*\.deviantart\.net/)) {
            // https://t00.deviantart.net/7PiX79OLWVS6WAzA0thSVYzWarQ=/300x200/filters:fixed_height(100,100):origin()/pre00/f044/th/pre/i/2004/235/7/b/megaman.jpg
            //   https://pre00.deviantart.net/f044/th/pre/i/2004/235/7/b/megaman.jpg
            // https://t00.deviantart.net/lNDj1np7JyLzN7U1MHhJlzp38Vs=/300x200/filters:fixed_height(100,100):origin()/pre00/4328/th/pre/f/2011/194/b/6/megaman_tribute_by_saiyagina-d3odj4t.jpg
            //   https://pre00.deviantart.net/4328/th/pre/f/2011/194/b/6/megaman_tribute_by_saiyagina-d3odj4t.jpg
            // https://t00.deviantart.net/hbXtsO07Julo2fHWk6VyTkPgU5Y=/fit-in/700x350/filters:fixed_height(100,100):origin()/pre00/034f/th/pre/i/2017/346/6/5/abyss___chibi_by_nightstar234-dbwhn28.png
            //   https://pre00.deviantart.net/034f/th/pre/i/2017/346/6/5/abyss___chibi_by_nightstar234-dbwhn28.png
            return src.replace(/:\/\/.*?\.deviantart\.net\/.*?\/[0-9]*x[0-9]*\/[^/]*\/([^/]*)\/(.*)/, "://$1\.deviantart\.net/$2");
        }

        if (domain.match(/img[0-9]*\.grazia\.fr/)) {
            // https://img3.grazia.fr/var/grazia/storage/images/article/cinema-solene-rigot-grande-petite-849768/13583494-1-fre-FR/Cinema-Solene-Rigot-grande-petite_exact1900x908_l.jpg
            //   https://img3.grazia.fr/var/grazia/storage/images/article/cinema-solene-rigot-grande-petite-849768/13583494-1-fre-FR/Cinema-Solene-Rigot-grande-petite.jpg
            return src.replace(/_[^/.]*(\.[^/.]*)$/, "$1");
        }

        if (domain.match(/static[0-9]*\.purepeople\.com/) ||
            domain.match(/static[0-9]*\.purebreak\.com/) ||
            domain.match(/static[0-9]*\.puretrend\.com/)) {
            // http://static1.purepeople.com/articles/8/21/01/98/@/2822958-l-actrice-solene-rigot-pour-le-film-en-950x0-1.jpg
            //   http://static1.purepeople.com/articles/8/21/01/98/@/2822958-l-actrice-solene-rigot-pour-le-film-en-0x0-1.jpg
            // http://static1.purepeople.com/articles/8/21/01/98/@/2822931-l-acteur-jose-garcia-pour-le-film-a-fon-114x114-1.jpg
            //   http://static1.purepeople.com/articles/8/21/01/98/@/2822931-l-acteur-jose-garcia-pour-le-film-a-fon-0x0-1.jpg
            // http://static1.purepeople.com/articles/4/20/07/24/@/2631120-solene-rigot-photocall-de-la-soiree-de-opengraph_1200-1.jpg
            //   http://static1.purepeople.com/articles/4/20/07/24/@/2631120-solene-rigot-photocall-de-la-soiree-de-opengraph_99999999x0-1.jpg
            // http://static1.purepeople.com/articles/4/20/07/24/@/2631120-solene-rigot-photocall-de-la-soiree-de-950x0-1.jpg
            //   http://static1.purepeople.com/articles/4/20/07/24/@/2631120-solene-rigot-photocall-de-la-soiree-de-999999999x0-1.jpg
            // http://static1.purebreak.com/articles/8/59/23/8/@/208690-ciara-800x0-2.jpg
            //   http://static1.purebreak.com/articles/8/59/23/8/@/208690-ciara-0x0-2.jpg
            // http://static1.puretrend.com/articles/5/13/91/15/@/1572135-ciara-joue-un-jeu-dangeureux-en-robe-950x0-2.jpg
            //return src.replace(/-[0-9]+x[0-9]+(-[0-9]*)?(\.[^/.]*)$/, "-0x0$1$2");
            return src.replace(/([-_])[0-9]+(?:x[0-9]+)?(-[0-9]\.[^/.]*)/, "$1999999999x0$2");
        }

        if (domain === "medias.unifrance.org") {
            // https://medias.unifrance.org/medias/143/107/27535/format_web/media.jpg
            //   https://medias.unifrance.org/medias/143/107/27535/format_page/jose-garcia.jpg
            return src.replace("/format_web/", "/format_page/");
        }

        if (domain.match(/img[0-9]*\.closermag\.fr/)) {
            // https://img3.closermag.fr/var/closermag/storage/images/bio-people/biographie-jose-garcia-112817/827937-1-fre-FR/Jose-Garcia_square500x500.jpg
            //   https://img3.closermag.fr/var/closermag/storage/images/bio-people/biographie-jose-garcia-112817/827937-1-fre-FR/Jose-Garcia.jpg
            return src.replace(/_[^/._]*(\.[^/.]*)$/, "$1");
        }

        if (domain.match(/[^.]*\.lisimg\.com/) ||
            domain.match(/[^.]*\.listal\.com/)) {
            // http://iv1.lisimg.com/image/10752485/628full-sol%C3%A8ne-rigot.jpg
            //   http://iv1.lisimg.com/image/10752485/0full-sol%C3%A8ne-rigot.jpg
            // http://i5.lisimg.com/10752485/70.jpg
            //   http://i5.lisimg.com/10752485/0full.jpg
            // http://lb1.lisimg.com/10752485/70.jpg
            //   http://lb1.lisimg.com/10752485/0full.jpg
            // http://ilarge.lisimg.com/image/6915143/780full-sol%C3%A8ne-rigot.jpg
            //   http://ilarge.lisimg.com/image/6915143/0full.jpg
            return src.replace(/\/([^/]*)\.jpg$/, "/0full.jpg");
        }

        if (domain.indexOf(".lesinrocks.com") >= 0) {
            // https://www.lesinrocks.com/content/thumbs/uploads/2017/03/width-1120-height-612-srcset-1/solene-rigot-1.jpg - stretched
            //   https://www.lesinrocks.com/content/thumbs/uploads/2017/03/width-0-height-0-srcset-1/solene-rigot-1.jpg
            // https://statics.lesinrocks.com/content/thumbs/uploads/2017/12/width-100-height-100/nerd-no-one-ever-really-dies-album-cover-release-date-1.jpg
            //   https://www.lesinrocks.com/content/thumbs/uploads/2017/12/width-0-height-0/nerd-no-one-ever-really-dies-album-cover-release-date-1.jpg
            return src.replace(/\/width-[0-9]*-height-[0-9]*/, "/width-0-height-0");
        }

        if (domain === "media.senscritique.com") {
            // https://media.senscritique.com/media/000006647807/150_200/Solene_Rigot.png
            //   https://media.senscritique.com/media/000006647807/0_0/Solene_Rigot.png
            return src.replace(/\/[0-9]*_[0-9]*\/([^/]*)$/, "/0_0/$1");
        }

        if (domain === "www.franceinter.fr") {
            // https://www.franceinter.fr/s3/cruiser-production/2017/03/e97f73a2-2cba-4d48-bdc4-e50392aad75a/640_orpheline.jpg
            //   https://www.franceinter.fr/s3/cruiser-production/2017/03/e97f73a2-2cba-4d48-bdc4-e50392aad75a/orpheline.jpg
            return src.replace(/\/[0-9]*_([^/]*\.jpg)$/, "/$1");
        }

        if (domain === "www.vod.lu" &&
            src.indexOf("/media/cache/") >= 0) {
            // https://github.com/liip/LiipImagineBundle/issues/912 related?

            // http://www.vod.lu/media/cache/resolve/400x225/97/0c/970c16f8-fd8f-11e6-823c-d10fb8a0c611.jpg
            //   http://www.vod.lu/media/cache/resolve/9999999x9999999/97/0c/970c16f8-fd8f-11e6-823c-d10fb8a0c611.jpg
            // http://www.vod.lu/media/cache/190x253/92/7d/927da5b5-fd8f-11e6-9eab-ed7742afa678.jpg
            //   http://www.vod.lu/media/cache/9999999x9999999/92/7d/927da5b5-fd8f-11e6-9eab-ed7742afa678.jpg
            return src.replace(/\/media\/cache\/(resolve\/)?[0-9]+x[0-9]+\//, "/media/cache/$19999999x9999999/");
        }

        if (domain === "1645110239.rsc.cdn77.org") {
            // https://1645110239.rsc.cdn77.org/image/s300/q50/mm/befr/movies14119/posters/puppylove.0.jpg
            //   https://1645110239.rsc.cdn77.org/image/mm/befr/movies14119/posters/puppylove.jpg
            // https://1645110239.rsc.cdn77.org/image/x1200x800/q80/mm/been/movies17158/posters/orpheline-1.jpg
            //   https://1645110239.rsc.cdn77.org/image/mm/been/movies17158/posters/orpheline-1.jpg
            return src
                .replace(/\/image\/[a-z][0-9]+\//, "/image/") // to be repeated
                .replace(/\/image\/x[0-9]+x[0-9]+\//, "/image/")
                .replace(/\/([^/.]*)\.[0-9]+(\.[^/.]*)$/, "/$1$2");
        }

        if (domain === "diymag.com" &&
            src.indexOf("/media/img") >= 0) {
            // http://diymag.com/media/img/Artists/B/Beck/_1500x1000_crop_center-center_75/Beck-UpAllNightVideo.jpg
            //   http://diymag.com/media/img/Artists/B/Beck/Beck-UpAllNightVideo.jpg
            return src.replace(/(\/media\/img\/.*\/)_[^/]*\/([^/]*)$/, "$1$2");
        }

        if (domain === "1.fwcdn.pl") {
            // http://1.fwcdn.pl/ph/73/52/737352/569269_1.2.jpg
            // http://1.fwcdn.pl/ph/73/52/737352/569269_1.jpg
            //   http://1.fwcdn.pl/ph/73/52/737352/569269_1.1.jpg
            return src.replace(/(\/[^/.]*)(?:\.[0-9]*)?(\.[^/.]*)$/, "$1.1$2");
        }

        if (domain === "www.semainedelacritique.com" &&
            src.indexOf("/ttimg-rsz") >= 0) {
            // http://www.semainedelacritique.com/ttimg-rsz?src=/uploads/galleriemedia/ed9cf1c0cd7756b1e7e782f8bc2bc3d2.jpg&w=1200&h=800&q=100&zc=2&a=c
            //   http://www.semainedelacritique.com/uploads/galleriemedia/ed9cf1c0cd7756b1e7e782f8bc2bc3d2.jpg
            return urljoin(src, src.replace(/.*\/ttimg-rsz\?.*?src=([^&]*).*/, "$1"));
        }

        if (domain === "gal.img.pmdstatic.net") {
            // https://gal.img.pmdstatic.net/fit/https.3A.2F.2Fphoto.2Egala.2Efr.2Fupload.2Fslideshow.2Fquels-parrains-pour-les-revelations-cesar-les-photos-de-la-soiree-chanel-au-petit-palais-27606.2Fsolene-rigot-chien-et-son-parrain-samuel-benchetrit-475504.2Ejpg/400x600/quality/65/solene-rigot-chien-et-son-parrain-samuel-benchetrit.jpg
            //   https://photo.gala.fr/upload/slideshow/quels-parrains-pour-les-revelations-cesar-les-photos-de-la-soiree-chanel-au-petit-palais-27606/solene-rigot-chien-et-son-parrain-samuel-benchetrit-475504.jpg
            // http://gal.img.pmdstatic.net/fit/https.3A.2F.2Fi.2Eimgur.2Ecom.2FQK42KsW.2Ejpg/400x600/quality/65/test.jpg
            //   https://i.imgur.com/QK42KsW.jpg
            return decodeURIComponent(src.replace(/.*?\.pmdstatic\.net\/fit\/([^/]*).*/, "$1").replace(/\./g, "%"));
        }

        if (domain === "cdn.cnn.com") {
            // https://cdn.cnn.com/cnnnext/dam/assets/170301101237-emma-watson-selfies-exlarge-169.jpg
            //   https://cdn.cnn.com/cnnnext/dam/assets/170301101237-emma-watson-selfies.jpg
            // https://cdn.cnn.com/cnnnext/dam/assets/171226214729-carl-bernstein-12-26-super-169.jpg
            //   https://cdn.cnn.com/cnnnext/dam/assets/171226214729-carl-bernstein-12-26.jpg
            // https://cdn.cnn.com/cnnnext/dam/assets/170220104445-mark-turner-volvo-ocean-race-super-169.jpg
            //   https://cdn.cnn.com/cnnnext/dam/assets/170220104445-mark-turner-volvo-ocean-race.jpg
            // https://cdn.cnn.com/cnnnext/dam/assets/170303101934-emma-watson---premiere-full-169.jpg (definitely not full)
            //   https://cdn.cnn.com/cnnnext/dam/assets/170303101934-emma-watson---premiere.jpg
            // https://cdn.cnn.com/cnnnext/dam/assets/170307035422-emma-watson-on-kimmel-02-large-169.jpg
            //   https://cdn.cnn.com/cnnnext/dam/assets/170307035422-emma-watson-on-kimmel-02.jpg
            // https://cdn.cnn.com/cnnnext/dam/assets/180209072938-33-winter-olympics-opening-ceremony-0209-overlay-tease.jpg
            //   https://cdn.cnn.com/cnnnext/dam/assets/180209072938-33-winter-olympics-opening-ceremony-0209.jpg
            // https://cdn.cnn.com/cnnnext/dam/assets/180209112927-10-winter-olympics-opening-ceremony-0209-large-tease.jpg
            //   https://cdn.cnn.com/cnnnext/dam/assets/180209112927-10-winter-olympics-opening-ceremony-0209.jpg
            // https://cdn.cnn.com/cnnnext/dam/assets/180208122950-palestinian-deportee-6-large-alt-11.jpg
            //   https://cdn.cnn.com/cnnnext/dam/assets/180208122950-palestinian-deportee-6.jpg
            // doesn't work:
            // http://cdn.cnn.com/cnnnext/dam/assets/140630134917-12-canada-most-beautiful-places-super-169.jpg
            // http://cdn.cnn.com/cnnnext/dam/assets/140630134917-12-canada-most-beautiful-places-large-169.jpg
            // http://cdn.cnn.com/cnnnext/dam/assets/140630134917-12-canada-most-beautiful-places-exlarge-169.jpg
            // http://cdn.cnn.com/cnnnext/dam/assets/140630134917-12-canada-most-beautiful-places-full-169.jpg
            //return src.replace(/-(?:small|medium|large|exlarge|super|full|overlay)-[0-9]*(\.[^/.]*)$/, "$1");
            return src.replace(/-(?:small|medium|large|exlarge|super|full|overlay|alt|tease)(?:-(?:small|medium|large|exlarge|super|full|overlay|alt|tease))?(?:-[0-9]*)?(\.[^/.]*)$/, "$1");
            //return src.replace(/-[a-z]*-(?:169|tease)(\.[^/.]*)$/, "$1");
        }

        if (domain === "ugc.kn3.net" &&
            src.indexOf("/i/origin/") >= 0) {
            // https://ugc.kn3.net/i/origin/http://media3.popsugar-assets.com/files/2013/09/16/795/n/1922564/b962955383f6b80f_1592163256t6a65.xxxlarge_2x/i/Emma-Watson-all-legs-sexy-Peter-Pilotto-cutout-minidress.jpg
            return src.replace(/.*?\/i\/origin\//, "");
        }

        if (domain === "media.shoko.fr" ||
            domain === "media.melty.fr") {
            // https://media.shoko.fr/article-3410081-ajust_1000-f1483450645/emma-watson-en-2013-a-l-avant-premiere-de.jpg
            // https://media.shoko.fr/article-3410093-ratio_100-f1483451011/emma-watson-en-1998-une-star-est-nee.jpg
            // https://media.shoko.fr/media_aggregate-3410071-ajust_700-f1483450315/emma-watson-2014-look-red-carpet-harry-potter.jpg
            // https://media.shoko.fr/article-3410071-redim-f1483450315/emma-watson-en-2014-aux-brit-fashion-awards.jpg
            // https://media.shoko.fr/article-1234470-head/emma-watson-peoples-choice-awards-2013.jpg
            // https://media.shoko.fr/emma-watson-harry-potter-et-les-reliques-image-393422-article-head.jpg
            // https://media.melty.fr/article-3657708-thumb-f8/quantico-saison-3-priyanka-chopra-alex-tease.jpg
            // https://media.melty.fr/article-3658090-head-f4/rihanna-anniversaire-pornhub-film-porno-pornographie.jpg
            // https://media.melty.fr/article-3658090-full/booba-veut-arreter-sa-carriere-fergie-en.jpg
            // https://media.melty.fr/article-923024-head/meltylife-meryl-melty-fr-redactrice-travaille.jpg
            // different:
            // https://media.melty.fr/article-3657733-thumb-f8/julia-les-marseillais-australia-celibataire.jpg
            //   https://media.melty.fr/article-3657733-redim-f8/julia-les-marseillais-australia-celibataire.jpg
            return src
                .replace(/(:\/\/[^/]*)\/([^/]*?)-[^/-]*((?:-f[^/]*)?\.[^/.]*)$/, "$1/$2-redim$3")
                .replace(/(:\/\/[^/]*)\/([^/-]*?-[0-9]*-)[^/-]*(-f[^/]*)?\//, "$1/$2redim$3/");
        }

        if (domain.indexOf(".vogue.fr") >= 0 ||
            // http://www.glamourparis.com/uploads/images/thumbs/201637/48/rodarte_jpg_8718_north_458x687_white.jpg
            domain === "www.glamourparis.com" ||
            domain === "www.gqmagazine.fr") {
            // https://en.vogue.fr/uploads/images/thumbs/201804/a0/tee_1841.jpeg_north_499x_white.jpg
            //   https://en.vogue.fr/uploads/images/201804/a0/tee_1841.jpeg
            // https://en.vogue.fr/uploads/images/thumbs/201725/26/emma_watson__jpg_3972_jpeg_2620.jpeg_north_499x_white.jpg
            //   https://en.vogue.fr/uploads/images/201725/26/emma_watson__jpg_3972_jpeg_2620.jpeg
            // https://en.vogue.fr/uploads/images/thumbs/201725/55/emma_watson_miu_miu_the_circle_premiere_21_06_2017_paris_jpg_8082_jpeg_7667.jpeg_north_499x_white.jpg
            //   https://en.vogue.fr/uploads/images/201725/55/emma_watson_miu_miu_the_circle_premiere_21_06_2017_paris_jpg_8082_jpeg_7667.jpeg
            //
            // https://en.vogue.fr/uploads/images/thumbs/201712/d2/gettyimages_647393804_jpg_9242_north_499x_white.jpg
            //   https://en.vogue.fr/uploads/images/201712/d2/gettyimages_647393804_jpg_9242.jpg
            // https://en.vogue.fr/uploads/images/thumbs/201712/a4/emma_watson_in_givenchy_hc_par_rt_jpg_340_north_499x_white.jpg
            //   https://en.vogue.fr/uploads/images/201712/a4/emma_watson_in_givenchy_hc_par_rt_jpg_340.jpg
            //
            // http://www.gqmagazine.fr/uploads/images/thumbs/201803/b7/_vui0653_jpg_9983_north_640x960_transparent.jpg
            //   http://www.gqmagazine.fr/uploads/images/201803/b7/_vui0653_jpg_9983.jpg
            src = src
                .replace("/images/thumbs/", "/images/");
            newsrc = src.replace(/(\.[^/._]*)_[^/]*$/, "$1");
            if (newsrc !== src)
                return newsrc;
            return src.replace(/_north_[0-9]*x(?:[0-9]+)?_(?:white|transparent)(\.[^/.]*)$/, "$1");
        }

        if (domain === "img.culturacolectiva.com") {
            // https://img.culturacolectiva.com/featured/2017/10/bdfd42e4-138b-4037-8b56-8c309a3dc385-high.jpg
            // https://img.culturacolectiva.com/featured/2018/01/24/1516840709928/le-moine-le-moine-the-monk-13-07-2011-1-g_a_l-medium.jpg
            return src.replace(/-(?:high|medium|low)(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf(".reveliststatic.com") >= 0) {
            // http://ugc.reveliststatic.com/gen/constrain/800/800/80/2017/05/09/10/6x/ix/phdkya0kkk2qbwe.jpg
            //   http://ugc.reveliststatic.com/gen/full/2017/05/09/10/6x/ix/phdkya0kkk2qbwe.jpg
            return src.replace(/\/gen\/constrain\/[0-9]*\/[0-9]*\/[0-9]*\//, "/gen/full/");
        }

        if (domain === "static.giantbomb.com") {
            // https://static.giantbomb.com/uploads/square_medium/0/329/2767259-journey_20150721143742.jpg
            //   https://static.giantbomb.com/uploads/original/0/329/2767259-journey_20150721143742.jpg
            return src.replace(/\/uploads\/[^/]*\//, "/uploads/original/");
        }

        if (domain === "images.shazam.com") {
            // https://images.shazam.com/coverart/t113448093-b320004845_s400.jpg
            //   https://images.shazam.com/coverart/t113448093-b320004845_s0.jpg
            return src.replace(/_s[0-9]+(\.[^/.]*)$/, "_s0$1");
        }

        if (domain.indexOf(".ebayimg.com") >= 0) {
            // https://i.ebayimg.com/images/g/2lIAAOSwsS1Zkh1k/s-l300.jpg
            //   https://i.ebayimg.com/images/g/2lIAAOSwsS1Zkh1k/s-l9999.jpg
            // https://ssli.ebayimg.com/images/g/nqQAAOSwh2RZ6b1q/s-l500.jpg
            //   https://ssli.ebayimg.com/images/g/nqQAAOSwh2RZ6b1q/s-l9999.jpg
           // http://i.ebayimg.com/00/s/NjAwWDQ1MA==/z/mEAAAOSwKIpWBa25/$_23.JPG
            //   http://i.ebayimg.com/images/g/mEAAAOSwKIpWBa25/s-l9999.jpg
            newsrc = src.replace(/\/[0-9]+\/[a-z]+\/[^/]*\/[a-z]+\/([^/]+)\/[^/.]*(\.[^/.]*)$/, "/images/g/$1/s-l9999$2");
            if (newsrc !== src) {
                newsrc = newsrc.replace(/(.*\.)[^/.]*$/, "$1") + newsrc.replace(/.*\.([^/.]*)$/, "$1").toLowerCase();
                return newsrc;
            }

            return src
                .replace(/-l[0-9]+(\.[^/.]*)$/, "-l9999$1");
        }

        if (domain === "i.slkimg.com") {
            // https://i.slkimg.com/isv1/album/v5d0aa81654166d6a/3248641/web/3/fill/5,0/600.jpg
            //    https://i.slkimg.com/isv1/album/v5d0aa81654166d6a/3248641/web/3/999999999.jpg
            return src
                .replace(/\/fill\/[0-9]+,[0-9]+\//, "/")
                .replace(/[0-9]+(\.[^/.]*)$/, "999999999$1");
        }

        if (domain === "i.vimeocdn.com" &&
            src.indexOf("/filter/overlay") >= 0) {
            // https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F504371620_1280x720.jpg&src1=https%3A%2F%2Ff.vimeocdn.com%2Fimages_v6%2Fshare%2Fplay_icon_overlay.png
            //   https://i.vimeocdn.com/video/504371620_1280x720.jpg
            return decodeURIComponent(src.replace(/.*\/overlay\?.*?src0=([^&]*).*/, "$1"));
        }

        if (domain === "imagelab.nownews.com") {
            // https://imagelab.nownews.com/?w=300&q=70&src=https://rssimg.nownews.com/images/5a6f132bda68fc5330825347_201801292027.jpg
            //   https://rssimg.nownews.com/images/5a6f132bda68fc5330825347_201801292027.jpg
            // https://imagelab.nownews.com/?w=300&q=70&src=https%3A%2F%2Fimg.nownews.com%2Fnownews_production%2Fimages%2F5a6f3bb53d666a52fa4894d8_201801292320.png
            //   https://img.nownews.com/nownews_production/images/5a6f3bb53d666a52fa4894d8_201801292320.png
            return decodeURIComponent(src.replace(/.*[/?&]src=(.*)$/, "$1"));
        }

        if (domain === "cdn.discordapp.com") {
            // https://cdn.discordapp.com/avatars/191394916771823617/a_0cc6551148c73504703e5c4dba44bc0a.png?size=128
            //   https://cdn.discordapp.com/avatars/191394916771823617/a_0cc6551148c73504703e5c4dba44bc0a.png?size=2048
            return src.replace(/\?size=[0-9]*$/, "?size=2048");
        }

        if (domain.match(/images-ext-[0-9]*\.discordapp\.net/)) {
            // https://images-ext-1.discordapp.net/external/2rLDB8F8wm8zJBuYqxmLrM31K-VuJavo6cBLu62McoY/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/378382650597179392/10a9986e76557e24e53f8da2a573e6d1.webp?width=80&height=80
            //   https://cdn.discordapp.com/avatars/378382650597179392/10a9986e76557e24e53f8da2a573e6d1.webp?size=1024
            // https://images-ext-1.discordapp.net/external/Yu5JBnNXOrtdA4di9Pom8R5u-FXQVuHwUQVNA5VE6TQ/https/instagram.ftxl1-1.fna.fbcdn.net/vp/43a40cdb127e4b2731e0d73056813310/5B049080/t51.2885-15/e35/26293979_199841880752391_9218323895503814656_n.jpg?width=240&height=300
            //   https://instagram.ftxl1-1.fna.fbcdn.net/vp/43a40cdb127e4b2731e0d73056813310/5B049080/t51.2885-15/e35/26293979_199841880752391_9218323895503814656_n.jpg
            return decodeURIComponent(src.replace(/.*\/external\/[^/]*\/(?:([^/]*)\/)?(https?)\/(.*?)(?:\?[^/]*)?$/, "$2://$3$1"));
        }

        if (domain === "hot-korea.net") {
            // https://hot-korea.net/uploads/gallery/thumbs/1238.jpg
            //   https://hot-korea.net/uploads/gallery/1238.jpg
            return src.replace(/\/uploads\/([^/]*\/)thumbs\//, "/uploads/$1");
        }

        if (domain.match(/i[0-9]*\.sndcdn\.com/)) {
            // https://i1.sndcdn.com/avatars-000300362115-78ogrs-t500x500.jpg
            //   https://i1.sndcdn.com/avatars-000300362115-78ogrs-original.jpg
            return src.replace(/-[^-/.]*(\.[^/.]*)$/, "-original$1");
        }

        if (domain === "media.licdn.com") {
            // https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAAIsAAAAJDI3NTdjMDNhLWM3ZWMtNGQzZS04MGE1LWJjMzlkNWIzNDlhNw.jpg
            //   https://media.licdn.com/mpr/mpr/AAEAAQAAAAAAAAIsAAAAJDI3NTdjMDNhLWM3ZWMtNGQzZS04MGE1LWJjMzlkNWIzNDlhNw.jpg
            return src.replace(/\/shrinknp_[0-9]+_[0-9]+\//, "/");
        }

        if (domain.match(/bloximages\..*vip\.townnews\.com/) ||
            domain === "s3-ap-southeast-2.amazonaws.com") {
            // https://bloximages.chicago2.vip.townnews.com/tucson.com/content/tncms/assets/v3/editorial/9/e1/9e16bd10-2343-5819-a7c7-89a7d520c38e/5a653cb109be0.image.jpg?resize=750%2C1067
            // https://bloximages.newyork1.vip.townnews.com/roanoke.com/content/tncms/assets/v3/editorial/5/fd/5fd9841d-3b33-5f9a-b8e7-efb5a1730a65/5408aee812bf4.image.jpg
            // https://bloximages.newyork1.vip.townnews.com/heraldmailmedia.com/content/tncms/assets/v3/editorial/1/9a/19a45cfe-354a-11e3-939d-001a4bcf6878/5800f2836b369.image.jpg?resize=1200%2C675
            // https://s3-ap-southeast-2.amazonaws.com/syd.cdn.coreweb.com.au/136/1734561-our-neighbourhood-650x360.jpg
            return src.replace(/^(.*?:\/\/)[^/]*\//, "http://");
        }

        if (domain.match(/cdn[^.]*\.psbin\.com/)) {
            // http://cdnak1.psbin.com/img/mw=160/mh=210/cr=n/d=choz0/0gdge8mcb86p3dfk.jpg
            //   http://cdnak1.psbin.com/img/0gdge8mcb86p3dfk.jpg
            return src.replace(/\/img\/[^/]*=[^/]*\//, "/img/"); // repeated
        }

        if (domain === "wac.450f.edgecastcdn.net") {
            // http://wac.450f.edgecastcdn.net/80450F/k99.com/files/2013/01/JohnnyCarson_Facebook-630x477.jpg
            // http://wac.450f.edgecastcdn.net/80450F/banana1015.com/files/2013/04/Daryl-Salad-ft.jpg?w=600&h=0&zc=1&s=0&a=t&q=89
            // http://wac.450f.edgecastcdn.net/80450F/thefw.com/files/2012/06/Jimmy-Kimmel-Hooks-Kids-Up-to-Fake-Lie-Detector1.jpg
            // http://wac.450f.edgecastcdn.net/80450F/wokq.com/files/2015/11/12011246_10153099160181766_6355448705489009380_n.jpg
            // http://wac.450f.edgecastcdn.net/80450F/mix106radio.com/files/2017/05/RS8710_177369626.jpg?w=630&h=420&zc=1&s=0&a=t&q=89
            return src.replace(/^(.*?:\/\/)[^/]*\/80450F\//, "http://");
        }

        if (domain === "gp1.wac.edgecastcdn.net") {
            // https://gp1.wac.edgecastcdn.net/802892/http_public_production/musicians/images/458607/original/resize:248x186/crop:x0y8w740h554/hash:1467386813/1425323540_10201484920743713_511360204_n.jpg?1467386813
            //   https://gp1.wac.edgecastcdn.net/802892/http_public_production/musicians/images/458607/original/1425323540_10201484920743713_511360204_n.jpg?1467386813
            return src.replace(/(\/images\/[0-9]*\/[^/]*\/)[^/]*:[^/]*\//, "$1"); // repeated
        }

        if (domain === "www.century21.com") {
            // https://www.century21.com/c21/photo/320x240/c21.azureedge.net/1103i96/6m7cc0c7t2ke40abf3a2tgy386i96
            //   http://c21.azureedge.net/1103i96/6m7cc0c7t2ke40abf3a2tgy386i96
            // https://www.century21.com/c21/photo/maxxmax/c21.azureedge.net/1i103/rk8yf7dx6g8z4na3er4jc4m9b1i103
            //   http://c21.azureedge.net/1i103/rk8yf7dx6g8z4na3er4jc4m9b1i103
            return src.replace(/.*?\/photo\/[0-9a-z]*x[0-9a-z]*\//, "http://");
        }

        if (domain === "cdn.instructables.com") {
            // https://cdn.instructables.com/FK3/KJ6O/J1WW1VNZ/FK3KJ6OJ1WW1VNZ.RECTANGLE1.jpg
            //   https://cdn.instructables.com/ORIG/FK3/KJ6O/J1WW1VNZ/FK3KJ6OJ1WW1VNZ.jpg
            return src.replace(/(:\/\/[^/]*\/)(.*)\.[^/.]*(\.[^/.]*)$/, "$1ORIG/$2$3");
        }

        if (domain.match(/cdn[0-9]*-img\.pressreader\.com/)) {
            // https://cdn2-img.pressreader.com/pressdisplay/docserver/getimage.aspx?regionKey=nsDHuRjfHcgbdqHuZt9cKQ%3D%3D&scale=100
            //   https://cdn2-img.pressreader.com/pressdisplay/docserver/getimage.aspx?regionKey=nsDHuRjfHcgbdqHuZt9cKQ%3D%3D
            return src.replace(/getimage\.aspx[^/]*[?&](regionKey=[^&]*).*$/, "getimage.aspx?$1");
        }

        if (domain === "layfielddesign.com") {
            // http://layfielddesign.com/assets/uploads/project_images/_fullSize/harpers-bazaar-statistics.jpg
            //   http://layfielddesign.com/assets/uploads/project_images/harpers-bazaar-statistics.jpg
            return src.replace(/\/uploads\/([^/]*)\/_[^/]*\//, "/uploads/$1/");
        }

        if (domain === "mediaslide-europe.storage.googleapis.com") {
            // https://mediaslide-europe.storage.googleapis.com/uno/pictures/423/24823/large-1489494252-0801f3a26891df01462bae3da66cf8e7.jpg
            //   https://mediaslide-europe.storage.googleapis.com/uno/pictures/423/24823/1489494252-0801f3a26891df01462bae3da66cf8e7.jpg
            return src.replace(/\/[a-z]*-([^/]*)$/, "/$1");
        }

        if (domain.match(/m[^.]*\.netinfo\.bg/)) {
            // https://www.vesti.bg/galerii/foto/zvezdite-s-dve-razlichni-obuvki-na-cherveniia-kilim-4877/32735277
            //
            // https://mm.netinfo.bg/resize/resize_on_the_fly.php?address=media/images/32735/32735277/r-1024-768-obuvki-cherven-kilim-znamenitosti.jpg
            // https://m5.netinfo.bg/media/images/32735/32735277/r-1024-768-obuvki-cherven-kilim-znamenitosti.jpg
            // https://m5.netinfo.bg/media/images/32735/32735277/r-976-734-obuvki-cherven-kilim-znamenitosti.jpg
            // https://m5.netinfo.bg/media/images/32735/32735277/80-49-obuvki-cherven-kilim-znamenitosti.jpg
            // https://mm.netinfo.bg/resize/resize_on_the_fly.php?address=media/images/32713/32713259/orig-orig-emili-ratajkovski.jpg
            // https://mm.netinfo.bg/resize/resize_on_the_fly.php?address=media/images/32735/32735277/orig-orig-obuvki-cherven-kilim-znamenitosti.jpg
            //
            // https://m.netinfo.bg/media/images/32735/32735274/80-49-obuvki-cherven-kilim-znamenitosti.jpg
            return src.replace(/([/=]media\/images\/[0-9]*\/[0-9]*\/)(?:r-)?[^-/.]*-[^-/.]*/, "$1orig-orig");
        }

        if (domain === "i.imgur.com") {
            // https://i.imgur.com/ajsLfCab.jpg
            // https://i.imgur.com/ajsLfCam.jpg
            // https://i.imgur.com/ajsLfCal.jpg
            // https://i.imgur.com/ajsLfCa_d.jpg?maxwidth=520&shape=thumb&fidelity=high
            //   https://i.imgur.com/ajsLfCa.jpg
            // h, r, l, g, m, t, b, s
            return src.replace(/\/([a-zA-Z0-9]{7})(?:[hrlgmtbs]|_d)(\.[^/.?]*)$/, "/$1$2");
        }

        if (domain === "www.vidble.com") {
            // https://www.vidble.com/ZNOTKNmw6y_sqr.jpg
            //   https://www.vidble.com/ZNOTKNmw6y.jpg
            return src.replace(/_[^/._]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "itpro.nikkeibp.co.jp") {
            // http://itpro.nikkeibp.co.jp/pc/article/interview/20130319/1083744/thumb_420_ph2_px420.jpg
            //   http://itpro.nikkeibp.co.jp/pc/article/interview/20130319/1083744/ph2_px420.jpg
            return src.replace(/\/thumb_[0-9]+_([^/]*)$/, "/$1");
        }

        if (domain === "media-cdn.tripadvisor.com") {
            // https://media-cdn.tripadvisor.com/media/photo-s/0e/8d/a4/5e/hogwarts-express.jpg
            //   https://media-cdn.tripadvisor.com/media/photo-s/0e/8d/a4/5e/hogwarts-express.jpg
            // o, s, f, i, l, t
            return src.replace(/\/media\/photo-[a-z]\//, "/media/photo-o/");
        }

        if (domain === "www.traveller.com.au") {
            // http://www.traveller.com.au/content/dam/images/3/5/o/g/5/image.related.articleLeadwide.620x349.gz1l7v.png/1508294036655.jpg
            //   http://www.traveller.com.au/content/dam/images/3/5/o/g/5/image.related.articleLeadwide.620x349.gz1l7v.png
            //   http://www.traveller.com.au/content/dam/images/3/5/o/g/5/image.
            // http://www.traveller.com.au/content/dam/images/1/0/f/c/k/q/image.
            //return src.replace(/(\/images\/[0-9a-z]\/[0-9a-z]\/[0-9a-z]\/[0-9a-z]\/[0-9a-z]\/image\.).*$/, "$1");
            return src.replace(/(\/images\/(?:[0-9a-z]\/){4,}image\.).*$/, "$1");
        }

        if (domain === "getwallpapers.com") {
            // http://getwallpapers.com/wallpaper/small/4/b/a/573224.jpg
            //   http://getwallpapers.com/wallpaper/full/4/b/a/573224.jpg
            return src.replace(/\/wallpaper\/[^/]*\//, "/wallpaper/full/");
        }

        if (domain === "ideascdn.lego.com") {
            // https://ideascdn.lego.com/community/projects/be9/7b9/163334/2794778-o_1b5ccku8lf9a1sep1r8of4to8j7-thumbnail-b5Us8BCO1UerJg.png
            //   https://ideascdn.lego.com/community/projects/be9/7b9/163334/2794778-o_1b5ccku8lf9a1sep1r8of4to8j7.png
            // https://ideascdn.lego.com/community/projects/be9/7b9/163334/2794790-o_1b5ccmo8e53mofh1gnao2ag8ef-square-100.png
            return src
                .replace(/-thumbnail[^/.]*(\.[^/.]*)$/, "$1")
                .replace(/-square[^/.]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "images.newindianexpress.com") {
            // http://images.newindianexpress.com/uploads/user/imagelibrary/2018/2/2/w100X65/d5cd2a22045a49e1a1bfef3810b0144f.jpg
            //   http://images.newindianexpress.com/uploads/user/imagelibrary/2018/2/2/original/d5cd2a22045a49e1a1bfef3810b0144f.jpg
            return src.replace(/\/[wh][0-9]+X[0-9]*\//, "/original/");
        }

        if (domain === "image.spreadshirtmedia.com") {
            // https://image.spreadshirtmedia.com/image-server/v1/designs/1001957174,width=178,height=178/harry-potter-hogwarts-express-coffee-mug.png
            //   https://image.spreadshirtmedia.com/image-server/v1/designs/1001957174/harry-potter-hogwarts-express-coffee-mug.png
            return src.replace(/(\/[0-9]*),(?:[^=/,]*=[^=/,]*,?){1,}(\/[^/]*$)/, "$1$2");
        }

        if (domain.match(/staticr[0-9]*\.blastingcdn\.com/)) {
            // http://staticr1.blastingcdn.com/media/photogallery/2017/10/14/660x290/b_586x276/a-family-was-rescued-by-the-harry-potter-hogwarts-express-in-the-scottish-highlands-image-credit-pixabaycc0_1631843.jpg
            //   http://static.blastingnews.com/media/photogallery/2017/10/14/main/a-family-was-rescued-by-the-harry-potter-hogwarts-express-in-the-scottish-highlands-image-credit-pixabaycc0_1631843.jpg
            return src
                .replace(/\/b_[0-9]+x[0-9]+\/([^/]*)$/, "/$1")
                .replace(/\/[0-9]+x[0-9]+\/([^/]*)$/, "/main/$1");
        }

        if (domain === "www.gjdream.com") {
            // http://www.gjdream.com/news/contents/UPFILE/2018/20180201485362_tmb.jpg
            //   http://www.gjdream.com/news/contents/UPFILE/2018/20180201485362.jpg
            return src.replace(/_tmb(\.[^/.]*)$/, "$1");
        }

        if (domain === "www.imaeil.com") {
            // http://www.imaeil.com/m_wiz/imgsrc3.php?w=261&h=142&t=&rate=100&src=/news_img/event_plus/2018.02.02.14.04.38_mainphoto01_1.jpg
            //   http://www.imaeil.com//news_img/event_plus/2018.02.02.14.04.38_mainphoto01_1.jpg
            return src.replace(/\/m_wiz\/imgsrc[0-9]\.php.*?[?&]src=([^&]*).*/, "/$1");
        }

        if (domain === "www.kwnews.co.kr") {
            // untested due to it requiring download
            // http://www.kwnews.co.kr/kwnews_view.asp?kwurl=20180202-218020100137-3001.jpg
            //   http://www.kwnews.co.kr/newsphoto/2018/02/218020100137.jpg
            return src.replace(/\/kwnews_view\.asp?.*?kwurl=([0-9]{4})([0-9]{2})[0-9]*-([0-9]*)-[0-9]*(\.[^/.]*)$/, "/newsphoto/$1/$2/$3$4");
        }

        if (domain === "www.yeongnam.com" &&
            src.indexOf("/Photo/") >= 0) {
            // http://www.yeongnam.com/Photo/2018/01/26/S20180126.99001151846332501.jpg
            //   http://www.yeongnam.com/Photo/2018/01/26/R20180126.99001151846332501.jpg
            // R, L, M, S
            return src.replace(/\/[A-Z]([^/]*)$/, "/R$1");
        }

        if (domain === "db.kookje.co.kr") {
            // http://db.kookje.co.kr/news2000/photo/2018/0202/L20180202.22001000306i1.jpg
            // http://db.kookje.co.kr/news2000/photo/2012/0414/20120414.99002182507i1.jpg - 2568x1640
            //   http://db.kookje.co.kr/news2000/photo/2012/0414/L20120414.99002182507i1.jpg ??? (website overloaded, try again later, also generic 404 page)
            // L, S
            return src.replace(/\/[A-Z]([^/]*)$/, "/L$1");
        }

        if (domain === "www.kookje.co.kr") {
            // http://www.kookje.co.kr/news2011/screennews/thumb/466_20180305_20180305.99099001307i1.jpg
            //   http://www.kookje.co.kr/news2011/screennews/466_20180305_20180305.99099001307i1.jpg
            //   http://db.kookje.co.kr/news2000/photo/2018/0305/20180305.99099001307i1.jpg
            //   http://db.kookje.co.kr/news2000/photo/2018/0305/L20180305.99099001307i1.jpg
            // http://www.kookje.co.kr/news2011/screennews/466_20180305_20180305.99099001300i1.jpg
            //   http://db.kookje.co.kr/news2000/photo/2018/0305/20180305.99099001300i1.jpg
            //   http://db.kookje.co.kr/news2000/photo/2018/0305/L20180305.99099001300i1.jpg
            // http://www.kookje.co.kr/news2011/screennews/thumb/466_20180305_20180211.99099004174i1.jpg
            //   http://db.kookje.co.kr/news2000/photo/2018/0211/20180211.99099004174i1.jpg
            //   http://db.kookje.co.kr/news2000/photo/2018/0211/L20180211.99099004174i1.jpg
            return src
                .replace("/thumb/", "/")
                .replace(/.*\/[0-9]+_[0-9]+_([0-9]{4})([0-9]{4})([^/]*)$/, "http://db.kookje.co.kr/news2000/photo/$1/$2/L$1$2$3");
        }

        if (domain === "www.joongdo.co.kr") {
            // http://www.joongdo.co.kr/mnt/images/webdata/content/2018y/02m/01d/crop2018020101000198000004991.jpg
            //   http://www.joongdo.co.kr/mnt/images/file/2018y/02m/01d/2018020101000198000004991.jpg
            return src.replace(/\/webdata\/content\//, "/file/").replace(/\/[^0-9]*([0-9]*\.[^/.]*)$/, "/$1");
        }

        if (domain === "img.asiatoday.co.kr" && false) {
            // http://img.asiatoday.co.kr/webdata/content/2018y/02m/28d/20180228002024152_77_58.jpg
            //   http://img.asiatoday.co.kr/file/2018y/02m/28d/20180228002024152_1.jpg
            // http://img.asiatoday.co.kr/webdata/content/2018y/03m/09d/20180309010004779_77_58.jpg
            //   http://img.asiatoday.co.kr/file/2018y/03m/09d/20180309010004779_1.jpg - doesn't work
            //   http://img.asiatoday.co.kr/file/2018y/03m/09d/2018030901000828800047791.jpg - works
            // http://img.asiatoday.co.kr/webdata/content/2017y/03m/31d/20170331010021088_300_300.jpg
            //   http://img.asiatoday.co.kr/file/2017y/03m/31d/2017033101002937000210881.jpg
            return src.replace(/\/webdata\/content\/(.*)_[0-9]+_[0-9]+(\.[^/.]*)$/, "/file/$1_1$2");
        }

        if (domain === "jmagazine.joins.com") {
            // https://jmagazine.joins.com/_data/photo/2018/01/thumb_237268740_ZeJ4MpkI_1.jpg
            return src.replace(/\/thumb_([^/]*)$/, "/$1");
        }

        if (domain === "img.tvreport.co.kr") {
            // http://img.tvreport.co.kr/images/20171017/20171017_1508207555_22483100_4.jpg?1512513157
            //   http://img.tvreport.co.kr/images/20171017/20171017_1508207555_22483100_0.jpg?1512513157
            // http://img.tvreport.co.kr/images/20171211/20171211_1512955026_44177100_1.jpg (stretched)
            //   http://img.tvreport.co.kr/images/20171211/20171211_1512955026_44177100_0.jpg (smaller, but not stretched)
            // http://img.tvreport.co.kr/images/20171203/20171203_1512266720_61938500_1.jpg
            //   http://img.tvreport.co.kr/images/20171203/20171203_1512266720_61938500_0.jpg (larger)
            // 0 = original
            // 1 = large
            return src.replace(/_[0-9]*(\.[^/.]*)$/, "_0$1");
        }

        if (domain === "ojsfile.ohmynews.com") {
            // http://ojsfile.ohmynews.com/CT_T_IMG/2018/0131/IE002278988_APP.jpg?4957
            //   http://ojsfile.ohmynews.com/PHT_IMG_FILE/2018/0131/IE002278988_PHT.jpg
            //   http://ojsfile.ohmynews.com/BIG_IMG_FILE/2018/0131/IE002278988_BIG.jpg
            //   http://ojsfile.ohmynews.com/ORG_IMG_FILE/2018/0131/IE002278988_ORG.jpg
            // http://ojsfile.ohmynews.com/CT_T_IMG/2018/0201/IE002279450_APP.jpg?2034
            //   http://ojsfile.ohmynews.com/PHT_IMG_FILE/2018/0201/IE002279450_PHT.jpg
            //   http://ojsfile.ohmynews.com/BIG_IMG_FILE/2018/0201/IE002279450_BIG.jpg
            //   http://ojsfile.ohmynews.com/ORG_IMG_FILE/2018/0201/IE002279450_ORG.jpg
            // http://ojsfile.ohmynews.com/STD_IMG_FILE/2013/0705/IE001596678_STD.jpg
            //   http://ojsfile.ohmynews.com/ORG_IMG_FILE/2013/0705/IE001596678_ORG.jpg
            return src
                .replace(/\/CT_T_IMG\/(.*?)\/([^/]*)_APP(\.[^/.]*?)(?:\?.*)?$/, "/ORG_IMG_FILE/$1/$2_ORG$3")
                .replace(/\/[A-Z]*_IMG_FILE\/(.*?)\/([^/]*)_[A-Z]*(\.[^/.]*)(?:\?.*)?$/, "/ORG_IMG_FILE/$1/$2_ORG$3");
        }

        if (domain === "cmsimg.mnet.com") {
            // wip
            // http://cmsimg.mnet.com/clipimage/artist/240/000/428/428228.jpg
            // http://cmsimg.mnet.com/clipimage/vod/Other/000/058/58694.jpg
            // http://static.global.mnet.com/data/ucc/000/162/359
            // http://static.global.mnet.com/data/ucc/000/162/442
            // http://mnetimg.mnet.com/tvmnetimg/admin/poll/2014/10/1_1413538495789.jpg
            // http://cmsimg.mwave.me/pgmVideo/contentImgUrl/201711/10/0b694d59-29d6-4d36-8470-0e2db3a32e8f.jpg
            // https://cjmwave-prd.s3.ap-northeast-2.amazonaws.com/ion/front/editor/201801/10/e6d980fe-53c3-4604-bce7-08d98c7f2d99.jpg
            return src.replace(/(\/clipimage\/[^/]*)\/[0-9]*\//, "$1/1024/");
        }

        if (domain === "image.cloud.sbs.co.kr") {
            // http://image.cloud.sbs.co.kr/smr/clip/201605/20/ihv2JuZcKz8ChXAsxFPPpC_320.jpg
            //   http://image.cloud.sbs.co.kr/smr/clip/201605/20/ihv2JuZcKz8ChXAsxFPPpC.jpg
            return src.replace(/_[0-9]*(\.[^/.]*)$/, "$1");
        }

        if (domain.match(/cdn-ak-scissors\.[a-z]\.st-hatena\.com/) ||
            domain === "cdn.image.st-hatena.com") {
            // https://cdn-ak-scissors.b.st-hatena.com/image/scale/6b49da1455b11be153a6a5c060fbb6a65ada1cde/enlarge=0;height=480;type=max;version=1;width=480/https%3A%2F%2Fcdn.image.st-hatena.com%2Fimage%2Fscale%2F4220af82af99afcb2b70c52a3d4ee7a5cea0ba38%2Fbackend%3Dimager%3Benlarge%3D0%3Bheight%3D1000%3Bversion%3D1%3Bwidth%3D1200%2Fhttps%253A%252F%252Fcdn.user.blog.st-hatena.com%252Fdefault_entry_og_image%252F672828%252F1514219817468589
            //   https://cdn.image.st-hatena.com/image/scale/4220af82af99afcb2b70c52a3d4ee7a5cea0ba38/backend=imager;enlarge=0;height=1000;version=1;width=1200/https%3A%2F%2Fcdn.user.blog.st-hatena.com%2Fdefault_entry_og_image%2F672828%2F1514219817468589
            //   https://cdn.user.blog.st-hatena.com/default_entry_og_image/672828/1514219817468589
            // https://cdn-ak-scissors.b.st-hatena.com/image/square/2fc5e622ac7d1dc703f1059dcacff46f0afbb002/height=90;version=1;width=120/http://livedoor.blogimg.jp/milano/imgs/1/b/1b341774.jpg
            return decodeURIComponent(src.replace(/.*?\/image\/(?:scale|square)\/[^/]*\/[^/]*\/(.*)$/, "$1"));
        }

        if (domain === "pimg.togetter.com") {
            // https://pimg.togetter.com/1ac25d603c8ca6f205c7fbfb13f0413ed09017dc/68747470733a2f2f7062732e7477696d672e636f6d2f6d656469612f445536524d442d567741457a3969552e6a70673a6c61726765?w=1200&h=630&t=c
            //   https://pimg.togetter.com/1ac25d603c8ca6f205c7fbfb13f0413ed09017dc/68747470733a2f2f7062732e7477696d672e636f6d2f6d656469612f445536524d442d567741457a3969552e6a70673a6c61726765?w=o&h=o
            return src.replace(/\?[^/]*$/, "?w=o&h=o");
        }

        if (domain === "nimage.newsway.kr" && false) {
            // http://nimage.newsway.kr/phpwas/restmb_idxmake.php?idx=6&simg=20180116000099_0640.jpg
            // http://nimage.newsway.kr/phpwas/restmb_idxmake.php?idx=200&simg=20180202000058_1024.jpg
            return src.replace(/\/phpwas\/restmb_idxmake\.php.*?simg=([0-9]{4})([0-9]{2})([0-9]{2})([^&]*).*?$/, "/photo/$1/$2/$3/$1$2$3$4");

            // http://nimage.newsway.kr/photo/2018/02/01/20180201000273_0480.jpg
            // doesn't work for all:
            // http://nimage.newsway.kr/photo/2016/08/26/20160826000014_0640.png
            //return src.replace(/_[0-9]+(\.[^/.]*)$/, "_1024$1");
        }

        if (domain === "imgsrv.piclick.me") {
            // http://imgsrv.piclick.me/cimg/163x220xN_477539.jpg
            return src.replace(/\/cimg\/[0-9]+x[0-9]+x/, "/cimg/");
        }

        if (domain === "www.slate.com") {
            // http://www.slate.com/content/dam/slate/blogs/browbeat/2017/12/01/how_pixar_made_coco_the_biggest_box_office_hit_in_mexico_s_history/cocorgb_c041_41a_pubpub16565.jpg.CROP.promo-xlarge2.jpg
            //   http://www.slate.com/content/dam/slate/blogs/browbeat/2017/12/01/how_pixar_made_coco_the_biggest_box_office_hit_in_mexico_s_history/cocorgb_c041_41a_pubpub16565.jpg
            return src.replace(/(\/[^/.]*\.[^/.]*)\.[^/]*$/, "$1");
        }

        if (domain === "img.cinemablend.com") {
            // https://img.cinemablend.com/filter:scale/quill/3/d/0/6/a/d/3d06addd736f79f9449400bed217e59f98ff86af.jpg?mw=600
            //   https://img.cinemablend.com/quill/3/d/0/6/a/d/3d06addd736f79f9449400bed217e59f98ff86af.jpg
            return src.replace(/cinemablend\.com\/filter:[^/]*\/(.*?)(?:\?[^/]*)?$/, "cinemablend.com/$1");
        }

        if (domain.match(/r[0-9]*\.abcimg\.es/) &&
            src.indexOf("/resizer.php") >= 0) {
            // http://r1.abcimg.es/resizer/resizer.php?imagen=http%3A%2F%2Fwww.abc.es%2Fmedia%2Fsociedad%2F2018%2F02%2F01%2Freina-letizia-kYuH--420x236%40abc.jpg&nuevoancho=128&nuevoalto=73&crop=1&medio=abc
            //   http://www.abc.es/media/sociedad/2018/02/01/reina-letizia-kYuH--420x236@abc.jpg
            //   http://www.abc.es/media/sociedad/2018/02/01/reina-letizia-kgrH-U213052464546JvF-620x370@abc.jpg
            return decodeURIComponent(src.replace(/.*\/resizer\.php.*?[?&]imagen=([^&]*).*$/, "$1"));
        }

        if (domain.match(/ugc-[0-9]*\.cafemomstatic\.com/) && false) {
            // https://ugc-01.cafemomstatic.com/gen/crop/9999/9999/0/2018/02/01/11/4g/tr/po8puaj0cg72.png
            // http://ugc-01.cafemomstatic.com/gen/crop/9999/9999/0/2018/01/25/11/44/8r/ph1gxpvbeo2qbwe.jpg -- stretched
            return src.replace(/\/gen\/crop\/[0-9]*\/[0-9]*\/[0-9]*\//, "/gen/crop/9999/9999/0/");
        }

        if (domain === "vz.cnwimg.com") {
            // https://vz.cnwimg.com/thumbc-300x300/wp-content/uploads/2012/03/coco.jpg
            // https://vz.cnwimg.com/thumb-300x170/wp-content/uploads/2018/01/GettyImages-127497645.jpg
            return src.replace(/\/thumb[a-z]*-[0-9]+x[0-9]+\//, "/");
        }

        if (domain === "www.coleman-rayner.com" &&
            src.indexOf("/watermark/insertwm.php?") >= 0) {
            // http://www.coleman-rayner.com/watermark/insertwm.php?src=http%3A%2F%2Fwww.coleman-rayner.com%2Fwp-content%2Fuploads%2F2014%2F09%2F05.-INSIDE-COCO%E2%80%99S-LAS-VEGAS-WARDROBE-1000.jpg
            return decodeURIComponent(src.replace(/.*\/watermark\/insertwm\.php.*?[?&]src=([^&]*).*$/, "$1"));
        }

        if (domain === "media.guestofaguest.com") {
            // http://media.guestofaguest.com/t_card_medium/wp-content/uploads/wppa/Coco_Austin6.jpg
            //   http://media.guestofaguest.com/wp-content/uploads/wppa/Coco_Austin6.jpg
            return src.replace(/(:\/\/[^/]*\/)[^/]*\/(wp-content\/)/, "$1$2");
        }

        if (domain.match(/i[0-9]*\.heartyhosting\.com/)) {
            // https://i0.heartyhosting.com/starmagazine.com/wp-content/uploads/2016/01/ice-t-coco-austin-baby-chanel-body-anniversary-dress-05.jpg
            return src.replace(/.*?:\/\/[^/]*\//, "http://");
        }

        if (domain === "images.contactmusic.com") {
            // http://images.contactmusic.com/newsimages/wenn2949343_1_14734_24-cm.jpg
            //   http://images.contactmusic.com/newsimages/wenn2949343_1_14734_24.jpg
            return src.replace(/-cm(\.[^/.]*)$/, "$1");
        }

        if (domain === "d15mj6e6qmt1na.cloudfront.net") {
            // https://d15mj6e6qmt1na.cloudfront.net/i/19186419/600/c
            //   https://d15mj6e6qmt1na.cloudfront.net/i/19186419
            return src.replace(/(\/i\/[0-9]*)\/.*/, "$1");
        }

        if (domain.match(/tse[0-9]*\.mm\.bing\.net/)) {
            // https://tse1.mm.bing.net/th?id=Ad9e81485410912702a018d5f48ec0f5c&w=136&h=183&c=8&rs=1&qlt=90&pid=3.1&rm=2
            return src.replace(/\/th[^/]*[?&]id=([^&]*)&[^/]*$/, "/th?id=$1");
        }

        if (domain === "cdn.4archive.org") {
            // https://cdn.4archive.org/img/t4Drepmm.jpg
            //   https://cdn.4archive.org/img/t4Drepm.jpg
            return src.replace(/(\/img\/[^/.]{7})m(\.[^/.]*)$/, "$1$2");
        }

        if (domain === "i.4cdn.org") {
            // http://i.4cdn.org/hr/1517608108705s.jpg
            //   http://i.4cdn.org/hr/1517608108705.jpg
            return src.replace(/(\/[0-9]*)s(\.[^/.]*)$/, "$1$2");
        }

        if (domain === "file.tinnhac.com" ||
            domain === "file.tintuckpop.net" ||
            // different though? - and crop don't work
            // https://image.vtc.vn/resize/80x60/files/news/2018/02/21/-210540.jpg
            domain === "image.vtc.vn") {
            // https://file.tinnhac.com/crop/97x74/music/2018/02/03/3-e875.jpg
            //   https://file.tinnhac.com/music/2018/02/03/3-e875.jpg
            // https://file.tinnhac.com/resize/600x-/2016/05/25/1eca49c4b-0953.jpg
            //   https://file.tinnhac.com/2016/05/25/1eca49c4b-0953.jpg
            // http://file.tintuckpop.net/resize/640x-/2016/05/16/1a922-1670.jpg
            // http://file.tintuckpop.net/crop/210x158/tintuckpop/2018/02/22/shinminah-1519107250-d126.jpg
            return src
                .replace(/\/crop\/[-0-9]+x[-0-9]+\//, "/")
                .replace(/\/resize\/[-0-9]+x[-0-9]+\//, "/");
        }

        if (domain.indexOf(".zadn.vn") >= 0 ||
            domain.match(/image\.(?:[^/.]*\.)?vov\.vn/) ||
            domain === "media.laodong.vn") {
            // https://znews-photo-td.zadn.vn/w960/Uploaded/qfssu/2017_11_05/NGT.jpg
            //   https://znews-photo-td.zadn.vn/Uploaded/qfssu/2017_11_05/NGT.jpg
            // http://image.english.vov.vn/w490/uploaded/wzzqbijjvws/2016_02_25/tara_GCLM.jpg
            //   http://image.english.vov.vn/uploaded/wzzqbijjvws/2016_02_25/tara_GCLM.jpg
            // http://image.english.vov.vn/130x82/Uploaded/TmT2B47lHgLy8UZVeuKg/2018_02_04/Xoang_singing_DPVE.jpg
            // http://image.english.vov.vn/h500/uploaded/wzzqbijjvws/2016_03_14/tara_2_KUJE.jpg
            // https://baomoi-photo-2-td.zadn.vn/w700_r1m/16/03/13/105/18868393/9_65381.jpg
            // https://media.laodong.vn/Uploaded/thuctapsinh/2016_03_13/6_QVZZ.jpg?w=629&h=419&crop=auto&scale=both
            return src
                .replace(/(:\/\/[^/]*)\/[wh][0-9]+(?:_[^/]*)?\//, "$1/")
                .replace(/(:\/\/[^/]*)\/[0-9]+x[0-9]+\//, "$1/")
                .replace(/\?.*$/, "");
        }

        if (domain === "cdn.tuoitre.vn" ||
            domain === "dantricdn.com" ||
            // http://afamilycdn.com/thumb_w/660/2017/taf-0942-1509860607829.jpg
            domain === "afamilycdn.com" ||
            // https://cafebiz.cafebizcdn.vn/thumb_w/600/2016/14593683-10210661710609628-1503569961-n-1475666918244-crop-1475673547715.jpg
            //   https://cafebiz.cafebizcdn.vn/2016/14593683-10210661710609628-1503569961-n-1475666918244-crop-1475673547715.jpg
            //   http://cafebiz.cafebizcdn.vn/2016/14593683-10210661710609628-1503569961-n-1475666918244.jpg
            domain.indexOf(".cafebizcdn.vn") >= 0 ||
            domain.indexOf(".sohacdn.com") >= 0 ||
            domain.indexOf("kenh14cdn.com") >= 0 ||
            // https://dantricdn.com/zoom/327_245/2018/2/22/img4232-15192810897621333688893.jpg
            //   https://dantricdn.com/thumb_w/600/2018/2/22/img4232-15192810897621333688893.jpg
            domain === "dantricdn.com" ||
            // https://cafebiz.cafebizcdn.vn/zoom/420_264/2018/2/22/photo1519268407880-15192684078814005972.jpg
            domain === "cafebiz.cafebizcdn.vn" ||
            // https://vtv1.mediacdn.vn/zoom/93_93/2018/2/22/nauy-crop-1519281533709468961755.jpg
            domain.indexOf(".mediacdn.vn") >= 0) {
            // https://cdn.tuoitre.vn/thumb_w/640/2017/5-nguoi-ham-mo-1509855071319.jpg
            //   https://cdn.tuoitre.vn/2017/5-nguoi-ham-mo-1509855071319.jpg
            // https://dantricdn.com/thumb_w/640/487bd2df65/2016/09/24/chipi-1474675645816.jpg
            // http://sohanews.sohacdn.com/thumb_w/1000/2017/photo-1-1510035508692-0-57-337-600-crop-1510035607740.jpg
            //   http://sohanews.sohacdn.com/2017/photo-1-1510035508692.jpg
            return src
                .replace(/\/zoom\/[^/]*\//, "/")
                .replace(/-[0-9]+-[0-9]+-[0-9]+-[0-9]+-crop-[0-9]+(\.[^/.]*)$/, "$1")
                .replace(/-crop-[0-9]{13,}(\.[^/.]*)$/, "$1")
                .replace(/(:\/\/[^/]*)\/thumb_[a-z]\/[0-9]+\//, "$1/");
        }

        if (domain === "eva-img.24hstatic.com" ||
            // http://anh.24h.com.vn//upload/4-2017/images/2017-11-08/medium/1510125598-629-151011694144796-chi-pu-5.jpg
            domain === "anh.24h.com.vn" ||
            domain === "anh.eva.vn") {
            // https://eva-img.24hstatic.com/upload/1-2017/images/2017-01-18/large/1484712995-1ava.jpg
            //   https://eva-img.24hstatic.com/upload/1-2017/images/2017-01-18/large/1484712995-1ava.jpg
            // https://eva-img.24hstatic.com/upload/1-2017/images/2017-01-18/san-khau-dem-nhac-bi-chay-t-ara-van-nhiet-tinh-het-minh-vi-khan-gia-1-1484711458-width500height334.jpg
            // https://eva-img.24hstatic.com/upload/4-2017/images/2017-10-15/extra_large/1508037671-thumbnail.jpg
            //   https://eva-img.24hstatic.com/upload/4-2017/images/2017-10-15/1508037671-thumbnail.jpg
            // https://eva-img.24hstatic.com/upload/1-2018/images/2018-02-01/thumbnail/cover1-1517500750-188-width640height480.jpg
            //   https://eva-img.24hstatic.com/upload/1-2018/images/2018-02-01/cover1-1517500750-188-width640height480.jpg
            // https://anh.eva.vn///upload/1-2016/images/2016-03-13/medium/1457807610-ava1.jpg
            return src.replace(/(\/images\/[0-9]*-[0-9]*-[0-9]*\/)[^/]*\/([^/]*)$/, "$1$2");
        }

        if (domain.match(/static[0-9]*\.yan\.vn/)) {
            // http://static2.yan.vn/YanThumbNews/2167221/201711/260x130_414f9ea4-e35b-4b11-aed5-883b288ea050.jpg
            //   http://static2.yan.vn/YanThumbNews/2167221/201711/414f9ea4-e35b-4b11-aed5-883b288ea050.jpg
            return src.replace(/\/[0-9]+x[0-9]+_([^/]*)$/, "/$1");
        }

        if (domain === "image.thanhnien.vn") {
            // https://image.thanhnien.vn/1600/uploaded/phangiang/2016_03_12/anh_lfyk.jpg
            return src.replace(/(:\/\/[^/]*)\/[0-9]*\//, "$1/");
        }

        if (domain === "media-local.phunu365.net") {
            // http://media-local.phunu365.net/api1x1/res/ext/0x0/r/image.24h.com.vn/upload/1-2017/images/2017-01-16/1484562734-148456151330358-dia-1.jpg
            return src.replace(/.*?\/api[0-9]+x[0-9]+\/res\/ext\/[0-9]+x[0-9]+\/[^/]*\//, "http://");
        }

        if (domain.match(/.*media[0-9]*\.nguoiduatin\.vn/)) {
            // http://xmedia.nguoiduatin.vn/amp_thumb_x1120x832/ndt/16/03/12/202/18865226/8_288040.jpg
            // http://media1.nguoiduatin.vn/thumb_x680x354/media/le-nham-than/2018/02/04/hoa.png
            return src.replace(/(:\/\/[^/]*)\/[^/]*x[0-9]+x[0-9]+\//, "$1/");
        }

        if (domain === "www.wowkorea.live") {
            // http://www.wowkorea.live/img/album/8/42081/76033_m.jpg
            return src.replace(/(\/[0-9]*)_[a-z](\.[^/.]*)$/, "$1$2");
        }

        if (domain.match(/img[^.]*\.seoul\.co\.kr/)) {
            // http://img.seoul.co.kr/img/upload/2018/02/04/SSI_20180204221012_V.jpg
            //   http://img.seoul.co.kr/img/upload/2018/02/04/SSI_20180204221012.jpg
            // none, O, V, L, S, N, N2, N3, N4, N5
            // http://img.seoul.co.kr//img/upload/2017/02/20/SSI_20170220101030_V.jpg
            //   http://img.seoul.co.kr//img/upload/2017/02/20/SSI_20170220101030.jpg
            // (V, none), O, L, S, N,...
            // http://imgnn.seoul.co.kr/img//upload/2009/01/20/SSI_20090120114407_V.jpg
            //
            // http://img.seoul.co.kr/img/upload/2015/12/29/SSI_20151229090141_V.jpg
            //   http://img.seoul.co.kr/img/upload/2015/12/29/SSI_20151229090141.jpg - 2500x3235
            return src.replace(/_[A-Z](?:[0-9]){0,2}(\.[^/.]*)$/, "$1");
        }

        if (domain === "img.yonhapnews.co.kr") {
            // http://img.yonhapnews.co.kr/photo/yna/YH/2017/12/30/PYH2017123017200001300_P1.jpg
            //   http://img.yonhapnews.co.kr/photo/yna/YH/2017/12/30/PYH2017123017200001300_P4.jpg
            // http://img.yonhapnews.co.kr/etc/graphic/YH/2017/10/25/GYH2017102500160004400.jpg
            // http://img.yonhapnews.co.kr/etc/inner/EN/2018/02/19/AEN20180219010000315_02_i.jpg
            // http://img.yonhapnews.co.kr/etc/graphic/YH/2013/11/28/GYH2013112800040003900_P2.jpg
            // http://img.yonhapnews.co.kr/etc/inner/KR/2017/04/28/AKR20170428061900017_01_i.jpg
            // http://img.yonhapnews.co.kr/mpic/YH/2018/02/23/MYH20180223017200038.jpg (1920x1080)
            // http://img.yonhapnews.co.kr/etc/inner/KR/2016/11/03/AKR20161103119100061_01_i.jpg (3810x2704)
            return src.replace(/(\/PYH[^/_.]*)_[^/.]*(\.[^/.]*)$/, "$1_P4$2");
        }

        if (domain.match(/big[0-9]*\.yonhapnews\.co\.kr/)) {
            // http://big5.yonhapnews.co.kr:83/gate/big5/img.yonhapnews.co.kr/basic/template/ck/2018/02/09/tmp_4504_20180209103744.jpg
            //   http://img.yonhapnews.co.kr/basic/template/ck/2018/02/09/tmp_4504_20180209103744.jpg
            return src.replace(/.*:\/\/[^/]*\/gate\/[^/]*\//, "http://");
        }

        if (domain.indexOf(".bunjang.net") >= 0) {
            // http://seoul-p-studio.bunjang.net/product/64557873_1_1514396938_w320.jpg
            //   http://seoul-p-studio.bunjang.net/product/64557873_1_1514396938.jpg
            return src.replace(/_[wh][0-9]*(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf("betanews.heraldcorp.com") >= 0 ||
            domain === "www.betanews.net") {
            // http://betanews.heraldcorp.com:8080/imagedb/thumb/2017/0821/acc59960.jpg
            // http://www.betanews.net/imagedb/first/2018/0204/d37686d0.jpg
            // http://www.betanews.net/imagedb/main/thumb/805/805660.jpg
            return src
            .replace(/(\/imagedb\/(:?[^/]*\/)?)(?:first|thumb)\//, "$1orig/");
        }

        if (domain === "img.smlounge.co.kr") {
            // http://img.smlounge.co.kr/upload/grazia/article/201611/thumb/32609-190630-sampleM.jpg
            // http://www.smlounge.co.kr/upload/grazia/article/201801/thumb/37419-279467-sample.jpg
            return src.replace(/\/thumb\/([^/.]*)-sample[^/.-]*(\.[^/.]*)$/, "/$1$2");
        }

        if (domain === "img.etoday.co.kr" && false) {
            // wip
            // http://www.etoday.co.kr/news/section/newsview_photo.php?idxno=1315836&seq=1
            // http://img.etoday.co.kr/pto_db/2016/04/20160412091428_851269_450_691.jpg (450x691)
            // http://img.etoday.co.kr/html/lib_img_crop.php?id=851269&mw=300&mh=225 (doesn't go up to 691, stretches)
        }

        if (domain === "image.tving.com" &&
            src.indexOf("tving.com/resize.php") >= 0) {
            // http://image.tving.com/resize.php?u=http://image.tving.com/upload/smr/clip/2018/02/04/C01_150548_0405.jpg&w=228
            return src.replace(/.*:\/\/[^/]*\/resize\.php.*?[?&]u=([^&]*).*/, "$1");
        }

        if (domain === "cdn.pastemagazine.com") {
            // https://cdn.pastemagazine.com/www/articles/assets_c/2015/02/skyrim%20mod%206-thumb-500x281-138387.jpg
            //   https://cdn.pastemagazine.com/www/articles/skyrim%20mod%206.jpg
            return src.replace(/(\/www\/[^/]*\/)assets_[^/]*\/[0-9]*\/[0-9]*\/([^-]*)-.*(\.[^/.]*)$/, "$1$2$3");
        }

        if (domain === "www.agencyteo.com") {
            // http://www.agencyteo.com/news/download/28302/w/600/KakaoTalk_20161121_144905918.jpg
            //   http://www.agencyteo.com/news/download/28302/KakaoTalk_20161121_144905918.jpg
            // http://www.agencyteo.com/news/download/48614/w/600/735318-800w.jpg
            //   // http://www.agencyteo.com/news/download/48614/735318.jpg
            return src
                .replace(/-[0-9]*[wh]*(\.[^/.]*)$/, "$1")
                .replace(/(\/download\/[0-9]*\/)[wh]\/[0-9]*\//, "$1");
        }

        if (domain.match(/s[0-9]*\.riotpixels\.net/)) {
            // http://s01.riotpixels.net/data/37/29/3729e0a0-9e4c-4efa-9eb2-f89f17dde8fa.jpg.240p.jpg
            // http://s01.riotpixels.net/data/37/29/3729e0a0-9e4c-4efa-9eb2-f89f17dde8fa.jpg/screenshot.assassins-creed-origins.1920x1080.2017-11-25.87.jpg
            //   http://s01.riotpixels.net/data/37/29/3729e0a0-9e4c-4efa-9eb2-f89f17dde8fa.jpg
            // http://s01.riotpixels.net/data/b5/d0/b5d0cf29-9c4e-44f1-a2f4-1a5613453006.jpg.240p.jpg
            return src.replace(/(\/data\/[a-f0-9]*\/[a-f0-9]*\/[^./]*\.[^/.]*)[./].*$/, "$1");
        }

        if (domain.match(/assets[0-9]*\.ignimgs\.com/)) {
            // http://assets1.ignimgs.com/2018/02/02/ac-origins-the-hidden-ones---button-1517533272073_180h.jpg
            // http://assets1.ignimgs.com/2018/02/06/nightinthewoods-deck-ff6c25-1517944777381_358w.jpg
            // http://assets1.ignimgs.com/2017/05/09/1-1-1494366320371_grande.jpg
            //   http://assets1.ignimgs.com/2017/05/09/1-1-1494366320371.jpg
            //return src.replace(/_[0-9]*[wh](\.[^/.]*)$/, "$1");
            return src.replace(/_[^-_/.]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "static.gamespot.com") {
            // https://static.gamespot.com/uploads/square_tiny/1578/15789737/3348796-alteredcarbon.jpg
            //   https://static.gamespot.com/uploads/original/1578/15789737/3348796-alteredcarbon.jpg
            return src.replace(/\/uploads\/[^/]*\//, "/uploads/original/");
        }

        if (domain === "i.neoseeker.com" &&
            src.match(/\/size\/[0-9]+x[0-9]+\//)) {
            // https://i.neoseeker.com/size/166x85/1/n/1/1500662379_dbz_disc_display.jpg
            //   https://i.neoseeker.com/size/0x0/1/n/1/1500662379_dbz_disc_display.jpg
            return src.replace(/\/size\/[0-9]+x[0-9]+\//, "/size/0x0/");
        }

        if (domain === "i.neoseeker.com" &&
            src.match(/\/p\/[0-9]*\/[0-9]*\//)) {
            // https://i.neoseeker.com/p/206/46/dragon-ball-fighterz_thumb_pOUTR.jpg
            //   https://i.neoseeker.com/screenshots/MjA2LzQ2Lw==/dragon-ball-fighterz_image_pOUTR.jpg
            //   https://i.neoseeker.com/p/206/46/dragon-ball-fighterz_image_pOUTR.jpg
            return src.replace(/_thumb_([^/]*$)/, "_image_$1");
        }

        if (domain === "resource.supercheats.com") {
            // https://resource.supercheats.com/library/640w/ember/emb_intro.jpg
            // https://resource.supercheats.com/library/thumbs/2018/1515877801dlc.png
            return src.replace(/\/library\/(?:(?:[0-9]*[wh])|thumbs)\//, "/library/");
        }

        if (domain === "intergi-phoenix.s3.amazonaws.com") {
            // https://intergi-phoenix.s3.amazonaws.com/1021319/videos/5450791/images/thumb_large_Cod-WWII-dlc.jpg
            return src.replace(/\/images\/thumb_large_([^/]*)$/, "/images/$1");
        }

        if (domain === "www.primagames.com") {
            // https://www.primagames.com/media/images/news/Playdead-Inside-ResearchFacility-40.jpg/PRIMA/resize/100x/format/jpg
            return src.replace(/\/PRIMA\/.*/, "");
        }

        if (domain.match(/s[0-9]*-[^.]*\.ixquick\.com/)) {
            // https://s15-us2.ixquick.com/cgi-bin/serveimage?url=http%3A%2F%2Ft0.gstatic.com%2Fimages%3Fq%3Dtbn%3AANd9GcQybc24UPrYyg-TnWPRUYH7zgzbQXgL4P86ngojIWv8J-Fzom7dAA&sp=ea6bc994daf22079cacb1e62879fa8d4&anticache=581224
            return decodeURIComponent(src.replace(/.*\/serveimage.*?[?&]url=([^&]*).*/, "$1"));
        }

        if (domain === "beta.ems.ladbiblegroup.com") {
            // http://beta.ems.ladbiblegroup.com/s3/content/353x199/0b7434735a7a95090e0210baf66f63ed.png
            return src.replace(/\/s3\/content\/[0-9]+x[0-9]+\//, "/s3/content/");
        }

        if (domain === "mtv-intl.mtvnimages.com") {
            // http://mtv-intl.mtvnimages.com/uri/mgid:arc:content:mtvasia.com:cdeab016-8964-423d-96ae-8ec187190fef?ep=mtvasia.com&stage=live&format=jpg&quality=0.8&quality=0.85&width=656&height=369&crop=true
            return src.replace(/(\?ep=[^&]*).*/, "$1");
        }

        if (domain === "gaia.adage.com") {
            // http://gaia.adage.com/images/bin/image/x-large/GettyImages90319988832.jpg?1515686676
            // http://gaia.adage.com/images/bin/image/medium/Bud-Light-Super-Bowl-2018---Bud-Knight.jpg?1517433099
            return src.replace(/\/images\/bin\/image\/[^/]*\//, "/images/bin/image/");
        }

        if (domain === "t-eska.cdn.smcloud.net") {
            // http://t-eska.cdn.smcloud.net/hotplota/t/2/t/image/98343cf69b8e6bfcd82fd21c1573c5b4IMU2KOV8-en-0.jpg/ru-0-r-600,600-n-98343cf69b8e6bfcd82fd21c1573c5b4IMU2KOV8en0.jpg
            //   http://t-eska.cdn.smcloud.net/hotplota/t/2/t/image/98343cf69b8e6bfcd82fd21c1573c5b4IMU2KOV8-en-0.jpg/n-98343cf69b8e6bfcd82fd21c1573c5b4IMU2KOV8en0.jpg
            // http://t-eska.cdn.smcloud.net/hotplota/t/2/t/image/adc18921067ea9ca27d451b35ac4b964a2tUvABZ-prze.PNG/ru-0-ra-280,255-n-adc18921067ea9ca27d451b35ac4b964a2tUvABZprze.PNG
            //   http://t-eska.cdn.smcloud.net/hotplota/t/2/t/image/adc18921067ea9ca27d451b35ac4b964a2tUvABZ-prze.PNG/n-adc18921067ea9ca27d451b35ac4b964a2tUvABZprze.PNG
            return src.replace(/\/[^/]*?n-([^/]*)$/, "/n-$1");
        }

        if (domain === "cdn.wegow.com") {
            // https://cdn.wegow.com/media/artist-media/bad-gyal/bad-gyal-4132.-1x2560.jpg - stretched
            return src.replace(/\.[-0-9]*x[-0-9]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "www.ecestaticos.com") {
            // https://www.ecestaticos.com/image/clipping/330/74d2adf4c3ccfa3144086c71e16eabf3/alba-farelo-es-bad-gyal-una-de-las-mujeres-que-lidera-el-dancehall-espanol-gerard-lopez.jpg
            return src.replace(/\/clipping\/[0-9]*\//, "/clipping/0/");
        }

        if (domain === "sonarreykjavik.com" ||
            domain === "sonar.es") {
            // https://sonarreykjavik.com/system/attached_images/19379/medium/BadGyal_AlexisG%C3%B3mez.jpg?1513685256
            //   https://sonarreykjavik.com/system/attached_images/19379/large/BadGyal_AlexisG%C3%B3mez.jpg?1513685256
            //   https://sonarreykjavik.com/system/attached_images/19379/original/BadGyal_AlexisG%C3%B3mez.jpg?1513685256
            // https://sonar.es/system/attached_images/18702/medium/badgyal_xs_sonar2017_fernandoschlaepfer_004.jpg?1497713257
            return src.replace(/(\/attached_images\/[0-9]*\/)[^/]*\//, "$1original/");
        }

        if (domain === "pgw.udn.com.tw") {
            // https://pgw.udn.com.tw/gw/photo.php?u=https://uc.udn.com.tw/photo/2016/08/03/99/2447700.jpg&x=0&y=0&sw=0&sh=0&sl=W&fw=750
            return src.replace(/.*\/photo\.php.*?[?&]u=([^&]*).*/, "$1");
        }

        if (domain.match(/i[0-9]*\.hdslb\.com/)) {
            // https://i0.hdslb.com/bfs/bangumi/546991a5d3add9b550925b1168abf0a460e5f552.jpg@240w_320h.jpg
            return src.replace(/(\.[^/.]*)@[0-9]*[wh](?:_[0-9]*[wh])?(\.[^/.]*)$/, "$1");
        }

        if (domain === "d.ifengimg.com") {
            // http://d.ifengimg.com/w204_h115/p0.ifengimg.com/pmop/2017/1230/E538B9A1631291D8B1578F161157F26647C97944_size296_w448_h252.png
            return src.replace(/.*?\/[wh][0-9]*(?:_[wh][0-9]*)\//, "http://");
        }

        if (domain === "www.nationalgeographic.com") {
            // https://www.nationalgeographic.com/content/dam/magazine/rights-exempt/2012/04/unseen-titanic/01-port-bow-titanic-3x2.ngsversion.1492030266842.adapt.1900.1.jpg
            //   https://www.nationalgeographic.com/content/dam/magazine/rights-exempt/2012/04/unseen-titanic/01-port-bow-titanic-3x2.jpg
            return src.replace(/\.[^/]*(\.[^/.]*)$/, "$1");
        }

        // fixme: find other and merge with it
        if (domain === "media.mnn.com" ||
            // https://alljapantours.com/places-to-visit-in-japan/most-beautiful-places-in-japan/img/issue_04most_photo01.jpg.pagespeed.ce.woxsyqYnu2.jpg
            domain === "alljapantours.com" ||
            // http://shows.gqimg.com.cn/showspic/FashionImages/F2018MEN/paris/louis-vuitton/collection/_VUI0653h.jpg.100X150.jpg
            domain === "shows.gqimg.com.cn" ||
            // http://shows.vogueimg.com.cn/showspic/FashionImages/S2017CTR/paris/alexandre-vauthier/collection/_ARC0726h.jpg.100X150.jpg
            domain === "shows.vogueimg.com.cn" ||
            domain === "d26oc3sg82pgk3.cloudfront.net" ||
            domain === "d53l9d6fqlxs2.cloudfront.net") {
            // https://media.mnn.com/assets/images/2017/03/cyclops-2-titanic-wreck.jpg.653x0_q80_crop-smart.jpg
            //   https://media.mnn.com/assets/images/2017/03/cyclops-2-titanic-wreck.jpg
            // https://d26oc3sg82pgk3.cloudfront.net/files/media/uploads/zinnia/2017/08/22/0824-felicity-jones_cred_shutterstock-featureflash-photo-agency.jpg.644x420_q100.jpg
            //   https://d26oc3sg82pgk3.cloudfront.net/files/media/uploads/zinnia/2017/08/22/0824-felicity-jones_cred_shutterstock-featureflash-photo-agency.jpg
            // https://d53l9d6fqlxs2.cloudfront.net/photos/41/41127-tokyos-tak.jpg.660x0_q80_crop-scale_upscale.jpg
            //   https://d53l9d6fqlxs2.cloudfront.net/photos/41/41127-tokyos-tak.jpg
            return src.replace(/(\/[^/.]*\.[^/.]*)\.[^/]*$/, "$1");
        }

        if (domain === "img.bleacherreport.net") {
            // https://img.bleacherreport.net/cms/media/image/fa/2f/08/6e/dfb9/4c1f/b030/48ba951160bd/crop_exact_USATSI_10579599.jpg?w=460&h=259&q=75
            //   https://img.bleacherreport.net/cms/media/image/fa/2f/08/6e/dfb9/4c1f/b030/48ba951160bd/USATSI_10579599.jpg?w=999999999999&h=999999999999
            return src
                .replace(/\/crop_exact_([^/]*)$/, "/$1")
                .replace(/\?.*$/, "?w=999999999999&h=999999999999");
        }

        if (domain === "images.gr-assets.com") {
            // https://images.gr-assets.com/books/1403200898m/7923163.jpg
            // https://images.gr-assets.com/authors/1281489919p2/3443203.jpg
            // https://images.gr-assets.com/users/1268072620p2/1668975.jpg
            return src
                .replace(/(\/(?:authors|users)\/[0-9]*p)[0-9]\//, "$18/")
                .replace(/(\/books\/[0-9]*)[a-z]\//, "$1l/");
        }

        if (domain === "dynamic.indigoimages.ca") {
            // https://dynamic.indigoimages.ca/books/1506701655.jpg?altimages=false&scaleup=true&maxheight=515&width=380&quality=85&sale=0&lang=en
            // https://dynamic.indigoimages.ca/books/1506701655.jpg?width=999999999
            return src.replace(/(\?.*)?$/, "?width=999999999");
        }

        if (domain === "cdn.mos.cms.futurecdn.net") {
            // https://cdn.mos.cms.futurecdn.net/wtXpUq7DAuPqftGRshxtzD-650-80.jpg
            //   https://cdn.mos.cms.futurecdn.net/wtXpUq7DAuPqftGRshxtzD.jpg
            return src.replace(/-[0-9]+-[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain === "www.allkpop.com") {
            // https://www.allkpop.com/upload/2018/02/af/12101614/clc.jpg
            //   https://www.allkpop.com/upload/2018/02/af_org/12101614/clc.jpg
            return src.replace(/\/af\/([0-9]*\/[^/]*)$/, "/af_org/$1");
        }

        if (domain === "cwcontent.asiae.co.kr") {
            return src.replace(/^(.*?:\/\/).*\/[^/]*resize\/[0-9]*\/([^/]*)$/, "$1cphoto.asiae.co.kr/listimglink/4/$2");
            // http://cwcontent.asiae.co.kr/stooresize/32/2018020812382111881_1518061101.jpg
            //   http://cwcontent.asiae.co.kr/stooresize/28/2018020812382111881_1518061101.jpg
            //   http://cphoto.asiae.co.kr/listimglink/7/2018020812382111881_1518061101.jpg
            //   http://cphoto.asiae.co.kr/listimglink/4/2018020812382111881_1518061101.jpg - max
            // http://cwcontent.asiae.co.kr/amgimagelink/98/2018020408443101207A_1.jpg
            //   http://cphoto.asiae.co.kr/listimglink/4/201110161718307486692A_1.jpg - different
            // http://cwcontent.asiae.co.kr/asiaresize/80/2018021210005919425_1518397258.jpg
            //   http://cwcontent.asiae.co.kr/asiaresize/113/2018021210005919425_1518397258.jpg
            //   http://cwcontent.asiae.co.kr/asiaresize/132/2018021210005919425_1518397258.jpg
            //   http://cphoto.asiae.co.kr/listimglink/4/2018021210005919425_1518397258.jpg - max, same as above
            // http://cwcontent.asiae.co.kr/asiaresize/103/2018021210300316119_2.jpg
            //   http://cphoto.asiae.co.kr/listimglink/4/2018021210300316119_2.jpg - doesn't work
            //   http://cphoto.asiae.co.kr/listimglink/4/2018021210291519546_1518398953.jpg - proper
            // resize:
            // 28, 1, 20, 16, 3, 34, 18, 9, 35, 13, 21, 24, 39, 7, 15, 2, 23, 44, 11, 5, 22, 30, 4, 6, 25, 40, 8, 36, 47, 27, 48, 43, 46, 33, 17, 38, 41, 37, 14, 32, 45, 42, 31, 26, 12, 29, 10, 19
            // listimglink:
            // (4, 5 [=download]), 7, 6, 2, 3
            // amgimagelink:
            // (98, 12, 0), 11, 3, 14, 10, 4
        }

        if (domain === "cphoto.asiae.co.kr") {
            // http://cphoto.asiae.co.kr/listimglink/4/2015101609215433891_1.jpg - 2598x3354
            return src.replace(/\/listimglink\/[0-9]*\//, "/listimglink/4/");
        }

        if (domain === "thumbs-prod.si-cdn.com") {
            // https://thumbs-prod.si-cdn.com/eoEYA_2Hau4795uKoecUZZgz-3w=/800x600/filters:no_upscale()/https://public-media.smithsonianmag.com/filer/52/f9/52f93262-c29b-4a4f-b031-0c7ad145ed5f/42-33051942.jpg
            //   https://public-media.smithsonianmag.com/filer/52/f9/52f93262-c29b-4a4f-b031-0c7ad145ed5f/42-33051942.jpg
            return src.replace(/.*\/(https?:\/\/)/, "$1");
        }

        if (domain === "assets.atlasobscura.com") {
            // https://assets.atlasobscura.com/article_images/800x/17628/image.jpg
            return src.replace(/\/article_images\/[0-9]*x\//, "/article_images/");
        }

        if (domain === "gdb.voanews.com") {
            // https://gdb.voanews.com/FFF71CAB-7CA6-4876-831A-B7E44ED40BF4_w1200_r1_s.jpg
            //   https://gdb.voanews.com/FFF71CAB-7CA6-4876-831A-B7E44ED40BF4.jpg
            return src.replace(/_[^/.]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "wonderopolis.org" &&
            src.indexOf("/_img") >= 0) {
            // https://wonderopolis.org/_img?img=/wp-content/uploads/2012/01/squirell_shutterstock_6383917.jpg&transform=resizeCrop,720,450
            //   https://wonderopolis.org/_img?img=/wp-content/uploads/2012/01/squirell_shutterstock_6383917.jpg
            return src.replace(/\/_img.*?[?&](img=[^&]*).*/, "/_img?$1");
        }

        if (domain === "www.thehindu.com" ||
            domain === "www.gloria.hr" ||
            domain.match(/i[0-9]*-prod\.mirror\.co\.uk/) ||
            domain.match(/i[0-9]*-prod\.birminghammail\.co\.uk/) ||
            domain.match(/i[0-9]*-prod\.dailypost\.co\.uk/) ||
            domain.match(/i[0-9]*-prod\.bristolpost\.co\.uk/) ||
            domain.match(/cdn-[0-9]*\.independent\.ie/)) {
            // wip
            // http://www.thehindu.com/migration_catalog/article14926809.ece/alternates/FREE_660/30MPSQUIRREL
            // http://www.thehindu.com/migration_catalog/article14926809.ece/alternates/FREE_960/30MPSQUIRREL
            // http://www.thehindu.com/migration_catalog/article14926809.ece
            // http://www.thehindu.com/news/national/kerala/article22745555.ece/alternates/LANDSCAPE_100/Priya
            // http://www.thehindu.com/news/national/kerala/article22745555.ece/alternates/FREE_460/Priya
            // https://i2-prod.mirror.co.uk/incoming/article7024597.ece/ALTERNATES/s615/PAY-Three-cute-squirrels-CUDDLING.jpg
            // https://i2-prod.mirror.co.uk/incoming/article236507.ece/ALTERNATES/s615/FA8A36EC-B0C4-D13B-383835E6F08D4428.jpg
            // https://i2-prod.mirror.co.uk/incoming/article11181827.ece/ALTERNATES/s615b/PROD-JRP_LEC_140117lsquirral_002JPG.jpg
            // https://i2-prod.mirror.co.uk/incoming/article11691534.ece/ALTERNATES/s1227b/PAY-SQUIRREL-AND-BIRD.jpg
            // https://i2-prod.mirror.co.uk/incoming/article11691532.ece/ALTERNATES/s1227b/PAY-SQUIRREL-AND-BIRD.jpg
            // https://i2-prod.mirror.co.uk/incoming/article5603898.ece/ALTERNATES/s1200/PAY-Squirrels.jpg
            // https://i2-prod.mirror.co.uk/incoming/article11263183.ece/ALTERNATES/s1168v/VIDEO-SQUIRREL.jpg
            // https://i2-prod.mirror.co.uk/incoming/article12021721.ece/ALTERNATES/s1176b/MGP_MDG_1302182281JPG.jpg
            // https://i2-prod.mirror.co.uk/incoming/article12021243.ece/ALTERNATES/s270b/MAIN-paddy.jpg
            // https://i2-prod.mirror.co.uk/incoming/article8949472.ece/ALTERNATES/s270b/National-Lottery-Euromillions-ticket.jpg
            //   https://i2-prod.mirror.co.uk/incoming/article8949472.ece/ALTERNATES/s810/National-Lottery-Euromillions-ticket.jpg
            // https://i2-prod.mirror.co.uk/incoming/article12021158.ece/ALTERNATES/s508/RIP-Pizza-Express-give-away-free-meals-to-certain-customers-who-do-this-one-thing.jpg
            //   https://i2-prod.mirror.co.uk/incoming/article12021158.ece/ALTERNATES/s615/RIP-Pizza-Express-give-away-free-meals-to-certain-customers-who-do-this-one-thing.jpg
            //   https://i2-prod.mirror.co.uk/incoming/article12021158.ece/ALTERNATES/s810/RIP-Pizza-Express-give-away-free-meals-to-certain-customers-who-do-this-one-thing.jpg
            //   https://i2-prod.mirror.co.uk/incoming/article12021158.ece/ALTERNATES/s1200/RIP-Pizza-Express-give-away-free-meals-to-certain-customers-who-do-this-one-thing.jpg
            // https://i2-prod.mirror.co.uk/incoming/article4997473.ece/ALTERNATES/s298/Actress-Felicity-Jones.jpg
            // http://www.dailymirror.lk/article/Rare-albino-squirrel-posing-in-his-white-suit--126748.html
            //   http://static.dailymirror.lk/media/images/image_1491276569-ba3932b3dc.jpg
            //   http://static.dailymirror.lk/media/images/image_1491276584-77a6a42e37.jpg
            //   http://static.dailymirror.lk/media/images/image_1491276594-bc6ed40255.jpg
            // https://cdn-01.independent.ie/incoming/article35675982.ece/70a4f/AUTOCROP/w940/675787992.jpg
            // https://i2-prod.birminghammail.co.uk/news/midlands-news/article8438687.ece/ALTERNATES/s615b/Felicity-Jones-The-Worst-Witch.jpg
            //   https://i2-prod.birminghammail.co.uk/news/midlands-news/article8438687.ece/BINARY/Felicity-Jones-The-Worst-Witch.jpg
            // https://i2-prod.mirror.co.uk/incoming/article9801836.ece/ALTERNATES/s810/SUNDAYPEOPLE-PROD-Tara-Palmer-Tomkinson.jpg
            // https://i2-prod.mirror.co.uk/incoming/article7009917.ece/BINARY/CS85701845-1.png
            // https://i2-prod.dailypost.co.uk/incoming/article12849370.ece/binary/BigBubble.jpg
            // https://i2-prod.bristolpost.co.uk/incoming/article1143957.ece/BINARY/Elise-Britten-profile-pic-square.jpg
            // https://www.gloria.hr/moda/novosti/naomicampbell01jpg/6949668/alternates/FREE_580/NaomiCampbell01.jpg
            //return src.replace(/(\/article[0-9]*\.ece\/.*?)(?:alternates|ALTERNATES|AUTOCROP|autocrop)\/[^/]*\//, "$1BINARY/");
            return src.replace(/(?:alternates|ALTERNATES|AUTOCROP|autocrop)\/[^/]*\/([^/]*)$/, "BINARY/$1");
        }

        if (domain === "images.fandango.com") {
            // no noticeable change though
            // https://images.fandango.com/ImageRenderer/0/0/redesign/static/img/default_poster.png/0/images/masterrepository/performer%20images/p237485/thetempest2010-mv-19.jpg
            //   https://images.fandango.com/images/masterrepository/performer%20images/p237485/thetempest2010-mv-19.jpg
            // http://images.fandango.com/ImageRenderer/0/0/redesign/static/img/default_poster.png/0/images/masterrepository/performer%20images/p237485/felicityjones-cheri-7.jpg
            //   http://images.fandango.com/images/masterrepository/performer%20images/p237485/felicityjones-cheri-7.jpg
            return src.replace(/\/ImageRenderer\/.*?\/images\//, "/images/");
        }

        if (domain === "s3.amazonaws.com" &&
            src.match(/\/s3\.amazonaws\.com\/assets\.forward\.com\//)) {
            // https://s3.amazonaws.com/assets.forward.com/images/cropped/gettyimages-655344102-1500478034.jpg
            return src.replace(/.*:\/\/[^/]*\//, "http://");
        }

        if (domain === "assets.forward.com") {
            // http://assets.forward.com/images/cropped/gettyimages-655344102-1500478034.jpg
            //   http://assets.forward.com/images/gettyimages-655344102-1500478034.jpg
            return src.replace(/\/images\/cropped\//, "/images/");
        }

        if (domain === "www.thejewelleryeditor.com") {
            // http://www.thejewelleryeditor.com/media/images_thumbnails/filer_public_thumbnails/old/21228/Felicity-Jones-Finch-Oscars-2013.jpg__1536x0_q75_crop-scale_subsampling-2_upscale-false.jpg - stretched
            //   http://www.thejewelleryeditor.com/media/images/old/21228/Felicity-Jones-Finch-Oscars-2013.jpg
            return src.replace(/\/images_thumbnails\/[^/]*_thumbnails\/([^/]*\/[0-9]*\/[^/.]*\.[^_/.]*)__[^/]*$/, "/images/$1");
        }

        if (domain === "files.sharenator.com") {
            // https://files.sharenator.com/felicity-jones-s3504x4800-453760-1020.jpg
            //   https://files.sharenator.com/felicity-jones-s3504x4800-453760.jpg
            return src.replace(/(-[0-9]*)-[0-9]*(\.[^/.]*)$/, "$1$2");
        }

        if (domain === "cdn.jolie.de") {
            // http://cdn.jolie.de/297989-4137908-2/image160w/felicity-jones-oscars-2017.jpg
            //   http://cdn.jolie.de/297989-4137908-2/original/felicity-jones-oscars-2017.jpg
            return src.replace(/\/image[0-9]*[wh]\//, "/original/");
        }

        if (domain === "img.mp.itc.cn") {
            // http://img.mp.itc.cn/upload/20170227/aa7bad178ad94c1e94428c87b6227fc7_th.jpeg
            return src.replace(/_th(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf(".qpic.cn") >= 0) {
            // http://mmbiz.qpic.cn/mmbiz_jpg/HiaNy8LPboMwzXqYuvrlHAicCbwUffgUbjY2EgQa81icMQxeKHeG5dTmhupXk7MKHibwKQAtNxEbeceH7elpaTT2fw/640?wx_fmt=jpeg&_ot=1514246400129
            // https://puui.qpic.cn/vcover_vt_pic/0/7m7cvdfbslfme4u1478827029/260
            return src.replace(/\/[0-9]*(?:\?.*)?$/, "/0");
        }

        if (domain === "vogue.ua") {
            // https://vogue.ua/cache/gallery_x1160_watermark/uploads/image/dc0/ab2/a48/58b3a48ab2dc0.jpeg
            return src.replace(/\/cache\/[^/]*\/uploads\//, "/uploads/");
        }

        if (domain === "imagesvc.timeincuk.net") {
            // https://imagesvc.timeincuk.net/v3/keystone/image?w=441&url=http://ksassets.timeincuk.net/wp/uploads/sites/46/2016/12/Felicity-Jonesw-style-file-december-2016.jpg&q=82
            return src.replace(/.*?\/keystone\/image.*?[?&]url=([^&]*).*/, "$1");
        }

        if (domain.match(/gss[0-9]*\.bdstatic\.com/) ||
            domain.match(/gss[0-9]*\.baidu\.com/)) {
            if (src.indexOf("/timg?") >= 0) {
                // https://gss3.bdstatic.com/84oSdTum2Q5BphGlnYG/timg?wapp&quality=80&size=b150_150&subsize=20480&cut_x=0&cut_w=0&cut_y=0&cut_h=0&sec=1369815402&srctrace&di=c10cad3328e6895cc32131aa4cfa7d32&wh_rate=null&src=http%3A%2F%2Fimgsrc.baidu.com%2Fforum%2Fpic%2Fitem%2F90529822720e0cf3c1045a710046f21fbf09aa4c.jpg
                //   http://imgsrc.baidu.com/forum/pic/item/90529822720e0cf3c1045a710046f21fbf09aa4c.jpg
                return decodeURIComponent(src.replace(/.*?\/timg.*?[?&]src=([^&]*).*/, "$1"));
            }

            if (src.indexOf("/sign=") >= 0 ||
                src.indexOf("/pic/item/") >= 0) {
                return src.replace(/:\/\/[^/]*\/[^/]*\//, "://imgsrc.baidu.com/");
            }
        }

        if (domain === "imgsrc.baidu.com") {
            // http://imgsrc.baidu.com/forum/wh%3D200%2C90%3B/sign=a5aa97f7bb7eca80125031e5a113bbe4/f7582e381f30e924af22ade547086e061c95f734.jpg
            // http://imgsrc.baidu.com/forum/wh=200,90;/sign=a5aa97f7bb7eca80125031e5a113bbe4/f7582e381f30e924af22ade547086e061c95f734.jpg
            //   http://imgsrc.baidu.com/forum/w%3D580%3B/sign=fc7fb3a148a98226b8c12b2fbab9bb01/7af40ad162d9f2d34097153ba2ec8a136227cc5b.jpg - slightly larger
            //   http://imgsrc.baidu.com/forum/pic/item/f7582e381f30e924af22ade547086e061c95f734.jpg - orig?
            // http://imgsrc.baidu.com/forum/abpic/item/dda5e6fe9925bc31b6fe8f4b5edf8db1ca137017.jpg
            //   http://imgsrc.baidu.com/forum/pic/item/dda5e6fe9925bc31b6fe8f4b5edf8db1ca137017.jpg
            // http://imgsrc.baidu.com/forum/w%3D415/sign=e28730d85edf8db1bc2e7d653c22dddb/b164910a304e251f2b2dd5b8a786c9177e3e536c.jpg
            //   http://imgsrc.baidu.com/forum/pic/item/b164910a304e251f2b2dd5b8a786c9177e3e536c.jpg
            // https://gss1.bdstatic.com/9vo3dSag_xI4khGkpoWK1HF6hhy/baike/h%3D160/sign=750b8bdd9ceef01f52141cc3d0ff99e0/9345d688d43f879465467a97da1b0ef41ad53ac9.jpg
            //   https://gss1.bdstatic.com/9vo3dSag_xI4khGkpoWK1HF6hhy/baike/w%3D268%3Bg%3D0/sign=7f8d6ceafe246b607b0eb572d3c37d71/9345d688d43f879465467a97da1b0ef41ad53ac9.jpg
            //   https://gss1.bdstatic.com/9vo3dSag_xI4khGkpoWK1HF6hhy/baike/c0=baike933,5,5,933,330/sign=6ccfd69a7bf08202399f996d2a929088/9345d688d43f879465467a97da1b0ef41ad53ac9.jpg
            //   https://imgsrc.baidu.com/baike/c0=baike933,5,5,933,330/sign=6ccfd69a7bf08202399f996d2a929088/9345d688d43f879465467a97da1b0ef41ad53ac9.jpg
            //   http://imgsrc.baidu.com/baike/pic/item/9345d688d43f879465467a97da1b0ef41ad53ac9.jpg
            return src
                .replace("/abpic/item/", "/pic/item/")
                .replace(/\/[^/]*(?:=|%3D)[^/]*\/sign=[^/]*\//, "/pic/item/");
        }

        if (domain.indexOf("himg.baidu.com") >= 0) {
            // http://tb.himg.baidu.com/sys/portrait/item/57cf0859
            //    http://tb.himg.baidu.com/sys/portraitn/item/57cf0859
            //    http://tb.himg.baidu.com/sys/portraitm/item/57cf0859
            //    http://tb.himg.baidu.com/sys/portraitl/item/57cf0859
            //    http://tb.himg.baidu.com/sys/original/item/57cf0859 (doesn't matter the text, can be anything other than the ones above)
            //    http://himg.baidu.com/sys/original/item/57cf4b616e6748796559656f6e0859
            return src.replace(/\/sys\/[^/]*\/item\//, "/sys/original/item/");
        }

        if (domain === "a.ksd-i.com") {
            // https://a.ksd-i.com/s/160l_86400_82d10665e8e8ca12632547568577442d/static.koreastardaily.com/2017-10-24/99264-550368.jpg
            // https://a.ksd-i.com/s/480x_86400_53c96fbf9a6baa55c9b527dcbeb4928e/static.koreastardaily.com/2017-10-24/99264-550368.jpg
            //   http://static.koreastardaily.com/2017-10-24/99264-550368.jpg
            // https://a.ksd-i.com/s/160l_86400_aaf286b862dc657320f390e272bd7cb8/static.koreastardaily.com/2017-06-26/95799-521086.jpg
            // https://a.ksd-i.com/s/480x_86400_63072b0849030d169deca9872c37d761/static.koreastardaily.com/2017-10-24/99264-550364.jpg
            return src.replace(/.*:\/\/[^/]*\/s\/[^/]*\//, "http://");
        }

        if (domain === "pic.pimg.tw") {
            // https://pic.pimg.tw/silvia17895/1518597084-877783212_n.jpg
            //   https://pic.pimg.tw/silvia17895/1518597084-877783212.jpg
            // (none, l), b, m, n, q, s, t
            return src.replace(/_[a-z](\.[^/]*)$/, "$1");
        }

        if (domain === "www.helloidol.com" &&
            src.indexOf("/script/get_pic.php") >= 0) {
            // http://www.helloidol.com/script/get_pic.php?src=https://1.bp.blogspot.com/-iblNAdULcFY/WnkEGyGjySI/AAAAAAAADHQ/pgVIIcLeHOo6IngbASGuakOIpxBwHr8dACLcBGAs/s1600/Eulachacha-Waikiki.jpg&h=256&w=400&zc=1
            return src.replace(/.*\/script\/get_pic\.php.*?[?&]src=([^&]*).*?$/, "$1");
        }

        if (domain === "yams.akamaized.net" &&
            src.indexOf("/Assets/") >= 0) {
            // https://yams.akamaized.net/Assets/56/610/p0082761056.jpg
            return src.replace(/\/(?:[^/._]*_)?([^/_]*)$/, "/l_$1");
        }

        if (domain.match(/img[0-9]\.pixpo\.net/)) {
            // https://img1.pixpo.net/img/da/4/0dwxci32wc/sg_0DwXCi32Wc_t324x216.jpg
            return src.replace(/_t[0-9]+x[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain === "www.mirrormedia.mg" &&
            src.indexOf("/assets/images/") >= 0) {
            // https://www.mirrormedia.mg/assets/images/20170626110017-7cd692da02e985b28918adaf10d858ad-desktop.jpg
            return src.replace(/-desktop(\.[^/.]*)$/, "$1");
        }

        if (domain.match(/i[0-9]*\.kknews\.cc/)) {
            // https://i1.kknews.cc/SIG=32hj89t/p6700021qr20759nn46_s.jpg
            return src.replace(/_[a-z]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "resource.holyshare.com.tw") {
            // http://resource.holyshare.com.tw/uploads/article/85x65/1443691071QSo_1.png
            // http://resource.holyshare.com.tw/uploads/article/600x0/1413181844EmZ_1.jpg
            return src.replace(/\/article\/[0-9]*x[0-9]*\//, "/article/");
        }

        if (domain === "www.kyeongin.com") {
            // http://www.kyeongin.com/mnt/file_m/201802/2018021501001103400052931.jpg
            return src.replace("/file_m/", "/file/");
        }

        if (domain === "www.wallpaperup.com") {
            // https://www.wallpaperup.com/uploads/wallpapers/2013/04/05/70727/793b48d70207428a317f912ac9f1342e-250.jpg
            return src.replace(/-[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain.match(/[a-z]*\.wallhere\.com/)) {
            // https://c.wallhere.com/photos/e2/9a/women_brunette_model_Marina_Shimkovich_window_sill_jean_shorts_legs_barefoot-285016.jpg!d
            //   https://get.wallhere.com/photo/women_brunette_model_Marina_Shimkovich_window_sill_jean_shorts_legs_barefoot-285016.jpg
            // https://get.wallhere.com/photo/Asian-Sunny-Girls-Generation-SNSD-Person-Kwon-Yuri-Jessica-Jung-Im-Yoona-Choi-Sooyoung-Kim-Taeyeon-Kim-Hyoyeon-Seohyun-Tiffany-Hwang-finger-2560x1600-px-523643.jpg
            //   https://get.wallhere.com/photo/Asian-Sunny-Girls-Generation-SNSD-Person-Kwon-Yuri-Jessica-Jung-Im-Yoona-Choi-Sooyoung-Kim-Taeyeon-Kim-Hyoyeon-Seohyun-Tiffany-Hwang-finger-523643.jpg
            // https://get.wallhere.com/photo/5333x3000-px-Girls-Generation-K-pop-Korean-Lee-Soonkyu-Sunny-989174.jpg
            //   https://get.wallhere.com/photo/Girls-Generation-K-pop-Korean-Lee-Soonkyu-Sunny-989174.jpg
            return src
                .replace(/[a-z]*\.wallhere\.com/, "get.wallhere.com")
                .replace(/\/photos\/[0-9a-f]*\/[0-9a-f]*\/([^/.]*\.[^/.!]*).*?$/, "/photo/$1")
                .replace(/\/[0-9]+x[0-9]+-px-([^/]*)$/, "/$1")
                .replace(/-[0-9]+x[0-9]+-px-([0-9]+\.[^/.]*)$/, "-$1");
        }

        if (domain === "img.grouponcdn.com") {
            // https://img.grouponcdn.com/deal/nx2giiTu5SBQbemLQteLqW/shutterstock_140728459-2-1500x900/v1/c300x182.jpg
            return src.replace(/\/v[0-9]+\/[^/]*$/, "");
        }

        if (domain.match(/img[0-9]*\.goodfon\.com/)) {
            // https://img4.goodfon.com/wallpaper/middle/2/86/brevno-sova-ptitsa.jpg
            return src.replace(/\/wallpaper\/[^/]*\//, "/wallpaper/original/");
        }

        if (domain.indexOf(".c.yimg.jp") >= 0 &&
            src.match(/:\/\/[^/]*\/im_/)) {
            // https://lpt.c.yimg.jp/im_siggiQbAsU9YOpUOxobTU3EtUg---x200-y200/amd/20180215-00205238-okinawat-000-view.jpg
            //   https://lpt.c.yimg.jp/amd/20180215-00205238-okinawat-000-view.jpg
            // https://amd.c.yimg.jp/im_siggfkAIHQmt2wB5qZ4fql1LCw---x900-y506-q90-exp3h-pril/amd/20180216-00010002-ksbv-000-1-view.jpg
            //   https://amd.c.yimg.jp/amd/20180216-00010002-ksbv-000-1-view.jpg
            // https://iwiz-news-profile.c.yimg.jp/im_sigg6aeoTpWVSD8ZSZj4Bo7mBA---x64-y64-pril-n1-exp30d/d/iwiz-news-profile/img/nb34khhuyczsy7o6f4dsott4zq.png?1477551484
            //   https://iwiz-news-profile.c.yimg.jp/d/iwiz-news-profile/img/nb34khhuyczsy7o6f4dsott4zq.png?1477551484
            //return src.replace(/(:\/\/[^/]*)\/[^/]*(\/amd\/[^/]*)$/, "$1$2");
            return src.replace(/(:\/\/[^/]*\/)im_[^/]*\//, "$1");
        }

        if (domain.indexOf(".c.yimg.jp") >= 0 &&
            src.match(/:\/\/[^/]*\/sim\?/)) {
             // https://wing-auctions.c.yimg.jp/sim?furl=auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0402/users/0/4/9/4/ane6371969-img600x425-1518659462gyve6525845.jpg&dc=1&sr.fs=20000
            return src.replace(/.*:\/\/[^/]*\/sim.*?[?&]furl=([^&]*).*/, "http://$1");
        }

        if (domain === "av.watch.impress.co.jp") {
            // https://av.watch.impress.co.jp/img/avw/docs/1106/827/01_s.jpg
            //   https://av.watch.impress.co.jp/img/avw/docs/1106/827/01_o.jpg
            return src.replace(/(\/[0-9]+)_s(\.[^/.]*)$/, "$1_o$2");
        }

        if (domain === "internet.watch.impress.co.jp"/* ||
            domain === "s.eximg.jp"*/) {
            // https://internet.watch.impress.co.jp/img/iw/docs/1106/860/01_s.jpg
            //   https://internet.watch.impress.co.jp/img/iw/docs/1106/860/01.jpg
            //
            // https://s.eximg.jp/exnews/feed/President/President_24421_0d46_1_s.jpg
            // https://s.eximg.jp/exnews/feed/Reuters/Reuters_newsml_KCN1G009M_1_s.jpg
            //   https://s.eximg.jp/exnews/feed/Reuters/Reuters_newsml_KCN1G009M_1.jpeg
            return src.replace(/(\/[0-9]+)_s(\.[^/.]*)$/, "$1$2");
            //return src.replace(/_s(\.[^/.]*)$/, "$1");
        }

        if (domain === "media.image.infoseek.co.jp") {
            // https://media.image.infoseek.co.jp/isnews/photos/mag2news/mag2news_350262_0-small.jpg
            return src.replace(/-[a-z]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "imgc.eximg.jp") {
            // https://imgc.eximg.jp/i=https%253A%252F%252Fs.eximg.jp%252Fexnews%252Ffeed%252FShouhin%252FShouhin_93784_1.jpg,zoom=400,type=jpg
            //   https://s.eximg.jp/exnews/feed/Shouhin/Shouhin_93784_1.jpg
            return decodeURIComponent(decodeURIComponent(src.replace(/.*?\/i=([^,]*).*?$/, "$1")));
        }

        if (domain === "image.itmedia.co.jp" &&
            !src.match(/\/l_[^/]*$/) &&
            !src.match(/\/[0-9]+_[^/]*$/)) {
            // http://image.itmedia.co.jp/news/articles/1802/16/koya_AP18039560928544.jpg
            //   http://image.itmedia.co.jp/news/articles/1802/16/l_koya_AP18039560928544.jpg
            // http://image.itmedia.co.jp/news/articles/1802/16/mm_houseten_02.jpg
            //   http://image.itmedia.co.jp/news/articles/1802/16/l_mm_houseten_02.jpg
            // http://image.itmedia.co.jp/news/articles/1802/16/nu_nec0216_02.jpg
            // doesn't work:
            // http://image.itmedia.co.jp/news/articles/1802/16/240_news084.jpg
            return src.replace(/\/([^/]*)$/, "/l_$1");
        }

        if (domain.match(/cdn[0-9]*\.bigcommerce\.com/)) {
            // http://cdn7.bigcommerce.com/s-aeyni5y9/images/stencil/500x659/products/517/520/bear_papa_7328_2__12787.1400287249.jpg?c=2
            //   http://cdn7.bigcommerce.com/s-aeyni5y9/images/stencil/original/products/517/520/bear_papa_7328_2__12787.1400287249.jpg?c=2
            // https://cdn7.bigcommerce.com/s-c14n6tful3/images/stencil/735x374/products/136/460/checkbox-categories-filter-for-product-search-preview-734x374__10327.1518675514.jpg?c=2&imbypass=on
            //   https://cdn7.bigcommerce.com/s-c14n6tful3/images/stencil/original/products/136/460/checkbox-categories-filter-for-product-search-preview-734x374__10327.1518675514.jpg?c=2&imbypass=on
            return src.replace(/\/images\/stencil\/[0-9]+x[0-9]+\//, "/images/stencil/original/");
        }

        if (domain.indexOf(".behance.net") >= 0 &&
            src.indexOf("/project_modules/") >= 0) {
            // https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/9e81bc25691931.5634a6d5ee11a.png
            // https://mir-s3-cdn-cf.behance.net/project_modules/1400/9e81bc25691931.5634a6d5ee11a.png
            // https://mir-s3-cdn-cf.behance.net/project_modules/disp/9e81bc25691931.5634a6d5ee11a.png
            // https://mir-s3-cdn-cf.behance.net/project_modules/hd/9e81bc25691931.5634a6d5ee11a.png
            // https://mir-s3-cdn-cf.behance.net/project_modules/fs/9e81bc25691931.5634a6d5ee11a.png
            //
            // https://mir-s3-cdn-cf.behance.net/project_modules/1400/828dc625691931.5634a721e19dd.jpg
            // https://mir-cdn.behance.net/v1/rendition/project_modules/1400/828dc625691931.5634a721e19dd.jpg
            // https://mir-s3-cdn-cf.behance.net/project_modules/fs/828dc625691931.5634a721e19dd.jpg
            //
            // https://mir-s3-cdn-cf.behance.net/project_modules/hd/ad62c919260569.562e23ee8f6be.jpg
            // https://mir-s3-cdn-cf.behance.net/project_modules/fs/ad62c919260569.562e23ee8f6be.jpg
            return src.replace(/\/project_modules\/[^/]*\//, "/project_modules/fs/");
        }

        if (domain === "www.worldatlas.com") {
            // https://www.worldatlas.com/r/w728-h425-c728x425/upload/22/a1/0a/shutterstock-330445028.jpg
            //   https://www.worldatlas.com/upload/22/a1/0a/shutterstock-330445028.jpg
            return src.replace(/(:\/\/[^/]*\/)r\/[^/]*\/(upload\/)/, "$1$2");
        }

        if (domain.match(/assets[0-9]*\.thrillist\.com/)) {
            // https://assets3.thrillist.com/v1/image/2642818/size/tmg-article_default_mobile.jpg
            // https://assets3.thrillist.com/v1/image/2642818/size/tl-horizontal_main.jpg
            // https://assets3.thrillist.com/v1/image/2729043/size/tl-right_rail_short.jpg
            // https://assets3.thrillist.com/v1/image/2728632/size/gn-gift_guide_variable_c.jpg
            // https://assets3.thrillist.com/v1/image/2442399/size/tmg-article_tall.jpg
            //   https://assets3.thrillist.com/v1/image/2442399
            // http://assets3.thrillist.com/v1/image/1210040
            return src.replace(/\/size\/[^/]*$/, "");
        }

        if (domain === "vacationidea.com" &&
            src.indexOf("/pix/") >= 0) {
            // http://vacationidea.com/pix/img25Hy8R/articles/t-b4_beautiful_places_oia,_santorin_27304_mobi.jpg
            //   http://vacationidea.com/pix/img25Hy8R/articles/t-b4_beautiful_places_oia,_santorin_27304.jpg
            return src.replace(/_mobi(\.[^/.]*)$/, "$1");
        }

        if (domain === "qph.fs.quoracdn.net") {
            // https://qph.fs.quoracdn.net/main-qimg-0f9434ad2ebdb0024bab1b334ce791a9-c
            return src.replace(/-[a-z]$/, "");
        }

        if (domain.indexOf(".fan.pw") >= 0 &&
            src.indexOf("/cpg/albums/") >= 0) {
            // http://actresses.fan.pw/cpg/albums/userpics/10001/thumb_001~64.jpg
            // http://actresses.fan.pw/cpg/albums/userpics/10001/normal_002~51.jpg
            //   http://actresses.fan.pw/cpg/albums/userpics/10001/002~51.jpg
            return src.replace(/\/[a-z]*_([^/]*)$/, "/$1");
        }

        if (domain.match(/c[0-9]*\.haibao\.cn/) && false) {
            // none work anymore
            // http://c3.haibao.cn/img/600_0_100_0/1258349756.6184/bigfiles/200946/1258349756.6184.jpg -- doesn't work
            // doesn't work: (any changes fail)
            // http://c3.haibao.cn/img/600_0_100_1/1443219715.4295/44ceff65db35a823fafb9572341a17e4.jpg
            // http://c2.haibao.cn/img/3620_5430_100_1/1498032292.4375/e2097b3504fdeefd6d94c0fbd8e3bcd6.jpg
            return src.replace(/\/img\/[0-9]+_[0-9]+_[0-9]+_[0-9]+\//, "/img/0_0_0_0/");
        }

        if (domain.match(/cdn[0-9]*\.hbimg\.cn/)) {
            // http://cdn4.hbimg.cn/store/thumbs/130_165/piccommon/1214/12147/D52599CFADB3EFF2DCBE83AF.jpg
            //   http://cdn4.hbimg.cn/store/wm/piccommon/1214/12147/D52599CFADB3EFF2DCBE83AF.jpg
            return src.replace(/\/thumbs\/[0-9]+(?:_[0-9]+)\//, "/wm/");
        }

        if (domain === "wallpaperset.com") {
            // https://wallpaperset.com/w/small/6/7/2/314686.jpg
            return src.replace(/(:\/\/[^/]*\/w\/)[^/]*\//, "$1full/");
        }

        // disabled due to redirects
        if (domain.indexOf(".wallpapermania.eu") >= 0 && false) {
            // http://www.wallpapermania.eu/download/2012-04/1037/emma-roberts-11-sexy-hd-wallpaper_1366x768.jpg
            //   http://www.wallpapermania.eu/images/data/2012-04/1037_emma-roberts-11-sexy-hd-wallpaper.jpg
            // http://static.wallpapermania.eu/images/thumbs/2012-04/1030_emma-roberts-4-sexy-hd-wallpaper.jpg
            //   http://www.wallpapermania.eu/images/data/2012-04/1030_emma-roberts-4-sexy-hd-wallpaper.jpg
            return src
                .replace("://static.wallpapermania.eu/", "://www.wallpapermania.eu/")
                .replace("/images/thumbs/", "/images/data/")
                .replace(/\/download\/([^/]*)\/([0-9]*)\/([^/.]*)_[0-9]+x[0-9]+(\.[^/.]*)$/, "/images/data/$1/$2_$3$4");
        }

        if (domain === "img-aws.ehowcdn.com" ||
            domain === "img.aws.ehowcdn.com" ||
            domain === "img.aws.livestrongcdn.com" ||
            domain === "img-aws.livestrongcdn.com") {
            // wip
            // https://img-aws.ehowcdn.com/750x428p/photos.demandstudios.com/getty/article/165/202/96162194.jpg
            //   http://photos.demandstudios.com/getty/article/165/202/96162194.jpg
            //
            // https://img-aws.ehowcdn.com/1440x520/cme/uploadedimages.demandmedia/chocmouse.jpg
            //
            // https://img-aws.ehowcdn.com/640/cme/photography.prod.demandstudios.com/8f9cba5d-f28d-47e7-bcc7-985cc310ce6a.jpg
            // https://img-aws.ehowcdn.com/1440/cme/photography.prod.demandstudios.com/8f9cba5d-f28d-47e7-bcc7-985cc310ce6a.jpg
            // http://img.aws.ehowcdn.com/intl-300m200/ds-photo/getty/article/129/156/86543427.jpg
            // http://img.aws.ehowcdn.com/intl-1200x630/ehow/images/a04/8n/pn/sell-wholesale-pandora-jewelry-800x800.jpg
            // http://img-aws.ehowcdn.com/default/ds-photo/getty/article/190/38/153473402_XS.jpg
            // https://img-aws.ehowcdn.com/default/getty/xc/87706466.jpg?v=1&c=EWSAsset&k=2&d=910C62E22B9F47AA92D0F6B5F9282134E184698B84D1D7E2E240CBB021893A9E
            //
            // http://img.aws.livestrongcdn.com/ls-article-image-400/cme/cme_public_images/www_livestrong_com/photos.demandstudios.com/getty/article/106/30/113475809_XS.jpg
            /*newsrc = src.replace(/.*?:\/\/[^/]*\/[0-9]+x[0-9]+p\//, "http://")
            if (newsrc !== src) {
                return newsrc;
            }*/
            newsrc = src
                .replace(/(:\/\/[^/]*\/)[^/]*\//, "$1default/");
            // breaks some urls:
            // https://img-aws.ehowcdn.com/150X100/getty/xc/87613263.jpg?v=1&c=EWSAsset&k=2&d=860EC25688CC8B2E9617B166F6C00C467D8EB72EFB52D4B89BE18AFE639C03A0
            //   https://img-aws.ehowcdn.com/default/getty/xc/87613263.jpg?v=1&c=EWSAsset&k=2&d=860EC25688CC8B2E9617B166F6C00C467D8EB72EFB52D4B89BE18AFE639C03A0
            //.replace(/\?.*$/, "");
            if (newsrc !== src) {
                return newsrc;
            }

            // http://img-aws.ehowcdn.com/300x200/photos.demandstudios.com/getty/article/88/150/87682980.jpg
            // http://img.aws.livestrongcdn.com/default/cme/cme_public_images/www_livestrong_com/photos.demandstudios.com/getty/article/92/185/472711312_XS.jpg
            newsrc = src.replace(/.*?:\/\/[^/]*\/.*?\/(photos\.demandstudios\.com\/)/, "http://$1");
            if (newsrc !== src) {
                return newsrc;
            }

            // https://img-aws.ehowcdn.com/640/ehow-food-blog-us/files/2014/12/edits-2282-1024x682.jpg
            // http://food-ehow-com.blog.ehow.com/files/2014/12/edits-2282-1024x682.jpg
            //   http://food-ehow-com.blog.ehow.com/files/2014/12/edits-2282.jpg
            newsrc = src.replace(/.*?:\/\/[^/]*\/[^/]*\/ehow-([^-/.]*)-blog-([^/.]*)\//, "http://$1-ehow-com.blog.ehow.com/");
            if (newsrc !== src) {
                return newsrc;
            }

            // http://img-aws.ehowcdn.com/615x200/cpi-studiod-com/www_ehow_com/i.ehow.com/images/a07/ai/07/prevent-soggy-graham-cracker-crust-800x800.jpg
            //   http://i.ehow.com/images/a07/ai/07/prevent-soggy-graham-cracker-crust-800x800.jpg
            // https://img-aws.ehowcdn.com/default/cme/cme_public_images/www_ehow_com/i.ehow.com/images/a04/pc/d6/season-pizza-stone-800x800.jpg
            // http://img-aws.ehowcdn.com/default/cme/cme_public_images/www_ehow_com/cdn-write.demandstudios.com/upload/image/18/2F/99D61A9C-FD10-4110-9241-BAA39E072F18/99D61A9C-FD10-4110-9241-BAA39E072F18.jpg
            //   http://cdn-write.demandstudios.com/upload/image/18/2F/99D61A9C-FD10-4110-9241-BAA39E072F18/99D61A9C-FD10-4110-9241-BAA39E072F18.jpg
            // doesn't work:
            // https://img-aws.ehowcdn.com/default/s3.amazonaws.com/cme_public_images/www_demandstudios_com/sitelife.studiod.com/ver1.0/Content/images/store/5/12/45fe6090-8ca0-4f71-9cb1-14efedc73b2e.Small.jpg
            newsrc = src.replace(/.*?:\/\/[^/]*\/.*?\/www_ehow_com\/([^/.]*\.[^/]*)\//, "http://$1/");
            if (newsrc !== src) {
                return newsrc;
            }

            // https://img-aws.ehowcdn.com/default/s3.amazonaws.com/cme_public_images/www_demandstudios_com/sitelife.studiod.com/ver1.0/Content/images/store/5/12/45fe6090-8ca0-4f71-9cb1-14efedc73b2e.Small.jpg
            newsrc = src.replace(/.*?:\/\/[^/]*\/[^/]*\/s3\.amazonaws\.com\//, "https://s3.amazonaws.com/");
            if (newsrc !== src) {
                return newsrc;
            }
        }

        if (domain === "s3.amazonaws.com" &&
            src.indexOf("s3.amazonaws.com/cme_public_images/") >= 0) {
            // http://s3.amazonaws.com/cme_public_images/www_livestrong_com/photos.demandstudios.com/getty/article/142/9/78291574_XS.jpg
            newsrc = src.replace(/.*?:\/\/[^/]*\/.*?\/(photos\.demandstudios\.com\/)/, "http://$1");
            if (newsrc !== src) {
                return newsrc;
            }
        }

        if (domain === "imageproxy.themaven.net") {
            // https://imageproxy.themaven.net/http%3A%2F%2Fimg.aws.livestrongcdn.com%2Fls-1200x630%2Fcme%2Fcme_public_images%2Fwww_livestrong_com%2Fphotos.demandstudios.com%2Fgetty%2Farticle%2F178%2F99%2F79711775_XS.jpg
            return decodeURIComponent(src.replace(/^.*?:\/\/[^/]*\//, ""));
        }

        if (domain.match(/photos[0-9]*\.demandstudios\.com/) &&
            src.indexOf("/dm-resize/") >= 0) {
            // http://photos2.demandstudios.com/dm-resize/s3.amazonaws.com%2Fcme_public_images%2Fwww_livestrong_com%2Fphotos.demandstudios.com%2Fgetty%2Farticle%2F142%2F9%2F78291574_XS.jpg?w=267&h=10000&keep_ratio=1
            return decodeURIComponent(src.replace(/.*?\/dm-resize\/([^/?]*).*/, "http://$1"));
        }

        if (domain.match(/photos[0-9]*\.demandstudios\.com/)) {
            // http://photos.demandstudios.com/getty/article/92/121/114336181_XS.jpg
            //   http://photos.demandstudios.com/getty/article/92/121/114336181.jpg
            // http://photos.demandstudios.com/getty/article/94/77/145190904_XS.jpg
            // http://photos.demandstudios.com/getty/article/225/172/476257962_XS.jpg
            // doesn't work:
            // photos.demandstudios.com/74/208/fotolia_608243_XS.jpg
            return src.replace(/(\/[0-9]+)_XS(\.[^/.]*)$/, "$1$2");
        }

        if (domain.indexOf(".abcnews.com") >= 0) {
            // https://s.abcnews.com/images/International/WireAP_118c1517b7f34b8bb7746eedfc01c12d_12x5_992.jpg
            //   https://s.abcnews.com/images/International/WireAP_118c1517b7f34b8bb7746eedfc01c12d.jpg
            // https://s.abcnews.com/images/US/chicago-pd-funeral-02-ap-jrl-180217_16x9t_240.jpg
            //   https://s.abcnews.com/images/US/chicago-pd-funeral-02-ap-jrl-180217.jpg
            // http://a.abcnews.com/images/Entertainment/GTY_sophie_turner_jef_150528_7x10_1600.jpg
            //   http://a.abcnews.com/images/Entertainment/GTY_sophie_turner_jef_150528.jpg
            return src.replace(/_[0-9]+x[0-9]+[a-z]?_[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain === "www.nationmultimedia.com") {
            // http://www.nationmultimedia.com/img/gallery/2017/10/14/194/9ef48d31930c4bbe00957654ab1aaf1a-vps.jpeg
            //   http://www.nationmultimedia.com/img/gallery/2017/10/14/194/9ef48d31930c4bbe00957654ab1aaf1a.jpeg
            // http://www.nationmultimedia.com/img/news/2018/02/18/30339149/b4065a2adeea2230b7d230a13eda5701-atwb.jpeg
            //   http://www.nationmultimedia.com/img/news/2018/02/18/30339149/b4065a2adeea2230b7d230a13eda5701.jpeg
            return src.replace(/-[^/.]*(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf(".indiatimes.com") >= 0 ||
            domain === "static.toiimg.com") {
            // https://timesofindia.indiatimes.com/thumb/msid-62829284,width-400,resizemode-4/62829284.jpg
            //   https://timesofindia.indiatimes.com/photo/62829284.cms
            // http://photogallery.indiatimes.com/thumb/62742103.cms?width=164&height=122
            //   http://photogallery.indiatimes.com/photo/62742103.cms
            // https://economictimes.indiatimes.com/thumb/msid-62966896,width-274,height-198/how-the-rs-11k-cr-nirav-modi-scandal-will-affect-diamantaires.jpg
            //   https://economictimes.indiatimes.com/photo/62966896.cms
            // https://static.toiimg.com/thumb/imgsize-376350,msid-62972146,width-200,resizemode-4/62972146.jpg
            //   https://static.toiimg.com/photo/62972146.cms
            newsrc = src.replace(/\/(?:thumb|photo)\/[^/]*msid-([0-9]*)[,/].*$/, "/photo/$1.cms");
            if (newsrc !== src)
                return newsrc;

            newsrc = src.replace(/\/(?:thumb|photo)\/(?:[^/]*\/)?([0-9]*)\.[^/.]*$/, "/photo/$1.cms");
            if (newsrc !== src)
                return newsrc;
        }

        if (domain === "www.jawapos.com") {
            // https://www.jawapos.com/thumbs/xs/news/2018/02/18/tips-menghadapi-kulit-kering-di-musim-hujan_m_189572.jpeg
            //   https://www.jawapos.com/thumbs/l/news/2018/02/18/tips-menghadapi-kulit-kering-di-musim-hujan_m_189572.jpeg
            //   https://www.jawapos.com/uploads/news/2018/02/18/tips-menghadapi-kulit-kering-di-musim-hujan_m_189572.jpeg
            return src.replace(/\/thumbs\/[^/]*\//, "/uploads/");
        }

        if (domain === "asia.nikkei.com") {
            // https://asia.nikkei.com/var/site_cache/storage/images/node_43/node_51/2018/201802/20180208t/20180208_malaysia-worker/8879284-1-eng-GB/20180208_Malaysia-worker_article_thumbnail.jpg
            // https://asia.nikkei.com/var/site_cache/storage/images/node_43/node_51/2018/201802/20180208t/20180208_malaysia-worker/8879284-1-eng-GB/20180208_Malaysia-worker_article_main_image.jpg
            // https://asia.nikkei.com/var/site_cache/storage/images/node_43/node_51/2018/201802/0217n/0217n-audi/8939471-1-eng-GB/0217N-Audi_large_image.jpg
            // https://asia.nikkei.com/var/site_cache/storage/images/node_43/node_51/2018/201802/20180213t/20180213_rocket/8908091-1-eng-GB/20180213_rocket_photo_galleries_thumbnail.jpg
            // https://asia.nikkei.com/var/site_cache/storage/images/node_43/node_51/2018/201802/20180213t/20180213_rocket/8908091-1-eng-GB/20180213_rocket_article_main_image.jpg
            // https://asia.nikkei.com/var/site_cache/storage/images/node_43/node_51/2018/201802/20180205t/20180130citiesocial-founder-eric-wang/8846170-2-eng-GB/20180130Citiesocial-Founder-Eric-Wang_more_in_thumbnail.jpg
            //   https://asia.nikkei.com/var/site_cache/storage/images/node_43/node_51/2018/201802/20180205t/20180130citiesocial-founder-eric-wang/8846170-2-eng-GB/20180130Citiesocial-Founder-Eric-Wang.jpg
            // https://asia.nikkei.com/var/site_cache/storage/images/top/viewpoints/humphrey-hawksley/5784021-2-app-WF/Humphrey-Hawksley_square80_thumbnail.png
            // https://asia.nikkei.com/var/site_cache/storage/images/top/magazine/20180215/8920429-1-app-WF/FREEDOM-OF-THE-OPPRESSION_cover_image.jpg
            // https://asia.nikkei.com/var/site_cache/storage/images/node_43/node_51/2018/201802/20180217t/20180217_panda/8940872-1-eng-GB/20180217_Panda_medium_thumbnail.jpg
            return src.replace(/_(?:article|large|medium|photo_galleries|more_in_thumbnail|square[0-9]*|cover_image)(?:_[a-z_]*)?(\.[^/.]*)$/, "$1");
        }

        if (domain === "www.tnnthailand.com") {
            // http://www.tnnthailand.com/stocks/media/thumb_big/0656a4.jpg
            //   http://www.tnnthailand.com/stocks/media/0656a4.jpg
            return src.replace(/\/media\/[^/]*\/([^/]*)$/, "/media/$1");
        }

        if (domain.match(/data[0-9]*\.ibtimes\.(?:co\.in|sg)/)) {
            // http://data1.ibtimes.co.in/cache-img-0-450/en/full/554638/1420537417_beant-singh.jpg
            //   http://data1.ibtimes.co.in/en/full/554638/1420537417_beant-singh.jpg
            // https://data.ibtimes.sg/en/full/16882/changi-airport.jpg?w=564&h=340&l=50&t=40
            // https://data.ibtimes.sg/en/thumb/21008/finance-minister-heng-swee-keat.jpg
            return src
                .replace(/(:\/\/[^/]*\/)cache-img-[0-9]*-[0-9]*\//, "$1")
                .replace(/\/[a-z]*(\/[0-9]+\/[^/]*)$/, "/full$1")
                .replace(/\?.*$/, "");
        }

        if (domain.match(/astro-image-resizer\.([^.]*\.)?amazonaws\.com/)) {
            // http://astro-image-resizer.s3-ap-southeast-1.amazonaws.com/17/resize/rojakdaily/media/jessica-chua/news/2018/jan/saying%20goodbye%20to%20anw%20pj%20outlet/115x76_a-w.png
            //   http://astrokentico.s3.amazonaws.com/rojakdaily/media/jessica-chua/news/2018/jan/saying%20goodbye%20to%20anw%20pj%20outlet/a-w.png?ext=.png
            //   http://astrokentico.s3.amazonaws.com/rojakdaily/media/jessica-chua/news/2018/jan/saying%20goodbye%20to%20anw%20pj%20outlet/a-w.png
            return src
                .replace(/astro-image-resizer\.([^.]*\.)?amazonaws\.com/, "astrokentico.s3.amazonaws.com")
                .replace(/(:\/\/[^/]*)\/[0-9]*\/resize\//, "$1/")
                .replace(/\/[0-9]+x[0-9]+_/, "/");
        }

        if (domain === "s3.amazonaws.com" &&
            src.indexOf("s3.amazonaws.com/nxs-wkrgtv-media") >= 0) {
            // http://s3.amazonaws.com/nxs-wkrgtv-media-us-east-1/photo/2018/02/17/Bail_Bonds_0_34542427_ver1.0_320_180.jpg
            return src.replace(/_[0-9]+_[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain === "image.photohito.k-img.com") {
            // http://image.photohito.k-img.com/uploads/photo33/user32067/a/7/a77a9f46cca054d6d488ab039382d140/a77a9f46cca054d6d488ab039382d140_s.jpg
            //   http://image.photohito.k-img.com/uploads/photo33/user32067/a/7/a77a9f46cca054d6d488ab039382d140/a77a9f46cca054d6d488ab039382d140_o.jpg
            // o, l, s
            return src.replace(/_[a-z]*(\.[^/]*)/, "_o$1");
        }

        if (domain === "image.yes24.com") {
            // http://image.yes24.com/goods/24213246/S
            // http://image.yes24.com/goods/24213246
            //   http://image.yes24.com/goods/24213246/L
            // http://image.yes24.com/dms/201802/%EC%8A%A4%EC%B9%B4%EC%9D%B4-%EA%B3%A0%EC%A0%95%EC%9A%B1.jpg
            return src.replace(/(:\/\/[^/]*\/goods\/[0-9]+)(?:\/.*)?$/, "$1/L");
        }

        if (domain === "img.danawa.com" ||
            // https://www.bellazon.com/main/uploads/monthly_01_2015/post-40923-0-58758100-1422215257_thumb.jpg
            domain === "www.bellazon.com") {
            // http://img.danawa.com/cms/img/2010/11/19/%C7%D6%C6%D1_thumb.png
            return src.replace(/_thumb(\.[^/.]*)$/, "$1");
        }

        if (domain === "item.ssgcdn.com") {
            // http://item.ssgcdn.com/58/31/79/item/1000023793158_i1_1000.jpg
            //   http://item.ssgcdn.com/58/31/79/item/1000023793158_i1.jpg
            return src.replace(/(\/item\/[^/]*)_[0-9]+(\.[^/.]*)$/, "$1$2");
        }

        if (domain.match(/thumbnail[0-9]*\.coupangcdn\.com/)) {
            // https://thumbnail3.coupangcdn.com/thumbnails/remote/48x48ex/image/product/image/vendoritem/2016/11/02/3054079121/95e6ce14-cd6e-43ef-89af-6f50046c19e8.jpg
            //   https://image3.coupangcdn.com/image/product/image/vendoritem/2016/11/02/3054079121/95e6ce14-cd6e-43ef-89af-6f50046c19e8.jpg
            return src
                .replace(/thumbnail([0-9]*\.coupangcdn\.com)/, "image$1")
                .replace(/\/thumbnails\/remote\/[^/]*\//, "/");
        }

        if (domain === "image.notepet.co.kr") {
            // http://image.notepet.co.kr/resize/540x-/seimage/20160127%2F201601271000_61120010294826_1.jpg
            return src.replace(/\/resize\/[^/]*\//, "/");
        }

        if (domain === "koreamg.com" ||
            domain === "yufit.co.kr") {
            // http://koreamg.com/web/product/big/201511/1198_shop1_844046.jpg
            // http://yufit.co.kr/web/product/medium/201802/1402_shop1_771117.jpg
            return src.replace(/\/web\/product\/(?:small|medium)\//, "/web/product/big/");
        }

        if (domain.indexOf(".mynavi.jp") >= 0) {
            // https://news.mynavi.jp/article/20160717-a030/images/004.jpg
            // https://news.mynavi.jp/article/20180219-586202/index_images/index.jpg/iapp
            //   https://news.mynavi.jp/article/20180219-586202/index_images/index.jpg
            //   https://news.mynavi.jp/article/20180219-586202/images/001l.jpg
            return src
                .replace(/\/index_images\/[^/]*(?:\/[^/]*)?$/, "/images/001l.jpg")
                .replace(/\/images\/([0-9]+)(\.[^/.]*)$/, "/images/$1l$2");
        }

        if (domain === "cdn.deview.co.jp") {
            // https://cdn.deview.co.jp/imgs/news_image.img.php?am_file=757f7eac8208248ef689a9c8f195cc0a.jpg&am_width=10&am_height=10
            // https://cdn.deview.co.jp/imgs/news_image.img.php?am_file=8a0abbef91348f3b44e2225c761fe8e8.jpg&am_width=0&am_height=0
            //   https://cdn.deview.co.jp/imgs/news/8/a/0/8a0abbef91348f3b44e2225c761fe8e8.jpg
            //return src.replace(/\/imgs\/news_image\.img\.php.*?(am_file=[^&]*).*/, "/imgs/news_image.img.php?$1&am_width=0&am_height=0");
            return src.replace(/\/imgs\/news_image\.img\.php.*?am_file=([^&])([^&])([^&])([^&]*).*/, "/imgs/news/$1/$2/$3/$1$2$3$4");
        }

        if (domain === "imgcache.dealmoon.com") {
            // http://imgcache.dealmoon.com/fsvr.dealmoon.com/dealmoon/082/3a3/a3a/e33/eed/93a/ffd/aae/d10/29e/37.jpg_600_0_15_363b.jpg
            //   http://fsvr.dealmoon.com/dealmoon/082/3a3/a3a/e33/eed/93a/ffd/aae/d10/29e/37.jpg
            return src.replace(/.*?:\/\/[^/]*\/(.*?)(\.[^/._]*)_[^/]*?$/, "http://$1$2");
        }

        // magento
        if (domain === "www.usmall.us" ||
            // http://www.sofiehouse.co/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/E/l/Elegant-Sweetheart-Long-Gold-Sequined-Taylor-Swift-Red-Carpet-Celebrity-Dress_2.jpg
            //   http://www.sofiehouse.co/media/catalog/product/E/l/Elegant-Sweetheart-Long-Gold-Sequined-Taylor-Swift-Red-Carpet-Celebrity-Dress_2.jpg
            domain === "www.sofiehouse.co" ||
            // https://www.thecelebritydresses.com/media/catalog/product/cache/1/small_image/295x/040ec09b1e35df139433887a97daa66f/t/a/taylor_swift_red_lace_party_dress_iheartradio_music_festival_2012_dresses_5.jpg
            //   https://www.thecelebritydresses.com/media/catalog/product/cache/1/image/650x/040ec09b1e35df139433887a97daa66f/t/a/taylor_swift_red_lace_party_dress_iheartradio_music_festival_2012_dresses_5.jpg
            //   https://www.thecelebritydresses.com/media/catalog/product/t/a/taylor_swift_red_lace_party_dress_iheartradio_music_festival_2012_dresses_5.jpg
            domain === "www.thecelebritydresses.com" ||
            // https://www.celebredcarpetdresses.com/media/catalog/product/cache/8/image/9df78eab33525d08d6e5fb8d27136e95/t/a/taylor-swift-at-the-2012-billboard-music-awards-2.jpg
            domain === "www.celebredcarpetdresses.com" ||
            // https://www.minimal.co.id/media/catalog/product/cache/1/small_image/252x/7b8fef0172c2eb72dd8fd366c999954c/1/3/136_02_02dsc00253ed.jpg
            //   https://www.minimal.co.id/media/catalog/product/1/3/136_02_02dsc00253ed.jpg
            domain === "www.minimal.co.id" ||
            domain === "www.lizandliz.com") {
            // https://www.sonassi.com/blog/knowledge-base/deconstructing-the-cache-image-path-on-magento
            //
            // http://www.usmall.us/media/catalog/product/cache/16/image/600x600/d58d44b981214661663244ef00ea7e30/1/7/17_9__2.jpg
            //   http://www.usmall.us/media/catalog/product/cache/16/image/d58d44b981214661663244ef00ea7e30/1/7/17_9__2.jpg
            // https://www.lizandliz.com/media/catalog/product/cache/4/thumbnail/492x705/9df78eab33525d08d6e5fb8d27136e95/t/a/taylor-swift-red-dress-cma-awards-2013-02.jpg
            //   https://www.lizandliz.com/media/catalog/product/cache/4/thumbnail/9df78eab33525d08d6e5fb8d27136e95/t/a/taylor-swift-red-dress-cma-awards-2013-02.jpg
            //   https://www.lizandliz.com/media/catalog/product/t/a/taylor-swift-red-dress-cma-awards-2013-02.jpg
            // https://www.lizandliz.com/media/catalog/product/cache/4/image/492x705/9df78eab33525d08d6e5fb8d27136e95/t/a/taylor-swift-red-dress-cma-awards-2013-01.jpg
            //   https://www.lizandliz.com/media/catalog/product/cache/4/image/9df78eab33525d08d6e5fb8d27136e95/t/a/taylor-swift-red-dress-cma-awards-2013-01.jpg
            //   https://www.lizandliz.com/media/catalog/product/t/a/taylor-swift-red-dress-cma-awards-2013-01.jpg
            /*return src
                .replace(/(\/cache\/[0-9]*\/)small_image\//, "$1/image/")
                .replace(/\/(thumbnail|image)\/[0-9]+x[0-9]+\//, "/$1/");*/
            return src.replace(/\/cache\/[0-9]*\/[^/]*\/(?:[0-9]+x(?:[0-9]+)?\/)?[0-9a-f]{32}\//, "/");
            //return src.replace(/\/image\/[0-9]+x[0-9]+\//, "/image/");
        }

        if (domain === "img.nextmag.com.tw") {
            // http://img.nextmag.com.tw//campaign/28/640x_dc09fc97b8f881555c21e8df08f39d01.jpg
            return src.replace(/\/[0-9]+x(?:[0-9]+)?_([^/]*)$/, "/$1");
        }

        if (domain.indexOf(".meitudata.com") >= 0) {
            // http://mvimg10.meitudata.com/568fd904846585397.jpg!thumb320
            return src.replace(/![^/]*$/, "");
        }

        if (domain === "www.shogakukan.co.jp") {
            // https://www.shogakukan.co.jp/thumbnail/books/09682221
            //   https://www.shogakukan.co.jp/thumbnail/snsbooks/09682221
            return src.replace(/\/thumbnail\/books\//, "/thumbnail/snsbooks/");
        }

        if (domain === "images.sysapi.mtg.now.com") {
            // https://images.sysapi.mtg.now.com/mposter/album/m/VASB00139622A_m.jpg
            //   https://images.sysapi.mtg.now.com/mposter/album/o/VASB00139622A_o.jpg
            return src.replace(/\/[a-z]\/([^/]*)_[a-z](\.[^/.]*)$/, "/o/$1_o$2");
        }

        if (domain.match(/img[0-9]*[^.]*\.lst\.fm/)) {
            // http://img2-ak.lst.fm/i/u/174s/ac79a7aa21de5694760ad9228e15c6a5.png
            //   http://img2-ak.lst.fm/i/u/ac79a7aa21de5694760ad9228e15c6a5.png
            return src.replace(/(\/i\/[a-z]\/)[0-9]+s\//, "$1");
        }

        if (domain === "www.hdwallpapers.in") {
            // https://www.hdwallpapers.in/download/selena_gomez_2018_4k_8k-1440x2560.jpg
            // https://www.hdwallpapers.in/thumbs/2018/selena_gomez_2018_4k_8k-t2.jpg
            //   https://www.hdwallpapers.in/walls/selena_gomez_2018_4k_8k-wide.jpg
            return src
                .replace(/\/(?:download|thumbs)\//, "/walls/")
                .replace(/-[^-_/.]*(\.[^/.]*)$/, "-wide$1");
        }

        if (domain.indexOf("images.deezer.com") >= 0) {
            // http://e-cdn-images.deezer.com/images/artist/7d026f08b34a098e270a663839d8ae8e/200x200-000000-80-0-0.jpg
            //   http://e-cdn-images.deezer.com/images/artist/7d026f08b34a098e270a663839d8ae8e/99999999999x99999999999-000000-100-0-0.jpg
            return src.replace(/\/[0-9]+x[0-9]+-[0-9]+-[0-9]+-[0-9]+-[0-9]+(\.[^/.]*)$/, "/99999999999x99999999999-000000-100-0-0$1");
        }

        if (domain === "cdn.wallpaper.com") {
            // https://cdn.wallpaper.com/main/styles/wp_medium_grid/s3/2018/02/astonmartindb11volantefrontsideview.jpg
            //   https://cdn.wallpaper.com/main/astonmartindb11volantefrontsideview.jpg
            // https://cdn.wallpaper.com/main/styles/wp_large/s3/2018/02/go_gardenofrussolo.jpg
            //   https://cdn.wallpaper.com/main/go_gardenofrussolo.jpg
            return src.replace(/\/styles\/[^/]*\/s[0-9]*\/[0-9]+\/[0-9]+\/([^/]*)$/, "/$1");
        }

        if (domain === "static.warthunder.com") {
            // https://static.warthunder.com/upload/image/wallpapers/_thumbs/280x/magach_3_1920x1080_logo_com_73e9f4582d0d841a6abf1f2c75beaf4d.jpg
            //   https://static.warthunder.com/upload/image/wallpapers/magach_3_1920x1080_logo_com_73e9f4582d0d841a6abf1f2c75beaf4d.jpg
            return src.replace(/\/_thumbs\/[0-9]+x(?:[0-9]+)?\//, "/");
        }

        if (domain === "cdn.wallpaperdirect.com") {
            // https://cdn.wallpaperdirect.com/shared-assets/images/products/094269_163x163_thumb.jpg
            //   https://cdn.wallpaperdirect.com/shared-assets/images/products/094269orig.jpg
            return src.replace(/(\/[0-9]*)_[^/.]*(\.[^/.]*)$/, "$1orig$2");
        }

        if (domain.indexOf(".bamcontent.com") >= 0) {
            // https://nhl.bamcontent.com/images/photos/291203200/2568x1444/cut.jpg
            return src.replace(/(\/images\/photos\/[0-9]*\/)[0-9]+x[0-9]+\/[^/.]*(\.[^/.]*)$/, "$1raw$2");
        }

        if (domain.match(/filed.*\.mail\.ru$/) &&
            src.match(/:\/\/[^/]*\/pic/)) {
            // https://filed17-26.my.mail.ru/pic?url=https%3A%2F%2Fcontent-17.foto.my.mail.ru%2Fmail%2Faudioknigi.online%2F_musicplaylistcover%2Fi-760.jpg&sigt=a2f820fc2604a1526688be9b380e7e24&ts=1519171200&mw=156&mh=156&croped=1
            //   https://content-17.foto.my.mail.ru/mail/audioknigi.online/_musicplaylistcover/i-760.jpg
            return decodeURIComponent(src.replace(/.*\/pic.*?[?&]url=([^&]*).*?$/, "$1"));
        }

        if (domain === "mg.soupingguo.com") {
            // http://mg.soupingguo.com/attchment2/AppImg/110x73/2016/01/26/c2d275d9-ffc4-4ca3-86d0-70f717f789dc.jpg
            //   http://mg.soupingguo.com/attchment2/AppImg/0x0/2016/01/26/c2d275d9-ffc4-4ca3-86d0-70f717f789dc.jpg
            return src.replace(/(\/attchment[^/]*\/[^/]*Img\/)[0-9]+x[0-9]+\//, "$10x0/");
        }

        if (domain === "img.yaplog.jp") {
            // http://img.yaplog.jp/img/17/mo/y/a/m/yamu98/24/24094.jpg
            //   http://img.yaplog.jp/img/17/pc/y/a/m/yamu98/24/24094.jpg
            return src.replace(/(\/img\/[^/]*\/)mo\//, "$1pc/");
        }

        if (domain === "www.hochi.co.jp") {
            // http://www.hochi.co.jp/photo/20180220/20180220-OHT1I50164-L.jpg
            // L, T, N
            return src.replace(/-[A-Z](\.[^/.]*)$/, "-L$1");
        }

        if (domain.indexOf(".wikispaces.com") >= 0) {
            // https://sweetteaandscience.wikispaces.com/file/view/111.jpg/539497268/460x315/111.jpg
            //   https://sweetteaandscience.wikispaces.com/file/view/111.jpg
            return src.replace(/(\/view\/[^/]*\.[^/]*)\/.*?$/, "$1");
        }

        if (domain === "cdn.mdpr.jp") {
            // wip
            // https://cdn.mdpr.jp/photo/images/9b/c4b/244c1e_129677c70cb47761dc2243224aee09db43068c042b172144.jpg
            // aligned:
            //   https://cdn.mdpr.jp/photo/images/9b/c4b/244c1e_  129677c70cb47761dc2243224aee09db43068c042b172144.jpg
            //   https://cdn.mdpr.jp/photo/images/9b/c4b/w700c-ez_129677c70cb47761dc22432245d7f66fdae68c042b172144.jpg
            // https://mdpr.jp/photo/images/2016/02/21/e_1997280.jpg
            //   https://mdpr.jp/photo/images/2016/02/21/1997280.jpg
            // https://mdpr.jp/photo/detail/3179461
            //   https://cdn.mdpr.jp/photo/images/73/014/w700c-ez_923f6fd535f050dd50a0c1844e00845cfda81f02f814a731.jpg
            // https://mdpr.jp/news/detail/1319088
            //   https://mdpr.jp/photo/images/2014/01/17/600c-_1181978.jpg
            //   https://mdpr.jp/photo/images/2014/01/17/e_1181978.jpg
            //   https://cdn.mdpr.jp/photo/images/de/f96/w700c-ez_5f31b9207ce33a447ceff0069f5057adc853bf29a07018d6.jpg
            // https://cdn.mdpr.jp/photo/images/ff/357/w720c-e_86733135a9e323a66d900f9f12614d8db65c8521f7b16fdc.jpg
            // http://mdpr.jp/news/detail/1672412
            //   https://cdn.mdpr.jp/photo/images/cb/aba/0_3c3602ff62198c52f8e11a287cfbf2542e7a8470e1cfdbc2.jpg
            //  https://mdpr.jp/photo/detail/2714005
            //   https://cdn.mdpr.jp/photo/images/4d/9be/0_eb892aca2b6f152631f04dbe0b7ec6d67bad6240e6373cd5.jpg
            //   https://cdn.mdpr.jp/photo/images/4d/9be/0_eb892aca2b6f152631f04dbe05759594bb7ec6d6e6373cd5.jpg - broken
            //   https://cdn.mdpr.jp/photo/images/4d/9be/w700c-ez_eb892aca2b6f152631f04dbe05759594bb7ec6d6e6373cd5.jpg
            //   https://cdn.mdpr.jp/photo/images/4d/9be/eb892aca2b6f152631f04dbe0b7ec6d67bad6240e6373cd5.jpg
        }

        if (domain === "www.sponichi.co.jp") {
            // http://www.sponichi.co.jp/entertainment/news/2017/12/12/jpeg/20171211s00041000381000p_thum.jpg
            //   http://www.sponichi.co.jp/entertainment/news/2017/12/12/jpeg/20171211s00041000381000p_view.jpg
            return src.replace(/_thum(\.[^/.]*)$/, "_view$1");
        }

        if (domain === "thumbnail.image.rakuten.co.jp") {
            // source:
            // https://books.rakuten.co.jp/rb/12499383/?scid=af_pc_etc&sc2id=af_111_1_10000673
            //
            // https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/3966/4907953093966.jpg?_ex=76x76
            //   https://tshop.r10s.jp/book/cabinet/3966/4907953093966.jpg?fitin=200:300&composite-to=*,*|200:300
            //   https://shop.r10s.jp/book/cabinet/3966/4907953093966.jpg
            return src.replace(/.*?:\/\/[^/]*\/@[^/]*\/([^?]*).*?$/, "http://shop.r10s.jp/$1");
        }

        if (domain === "www.billboard-japan.com") {
            // http://www.billboard-japan.com/scale/news/00000057/57632/800x_image.jpg - upscaled
            //   http://www.billboard-japan.com/scale/news/00000057/57632/image.jpg
            // http://www.billboard-japan.com/scale/news/00000057/57981/170x170_image.jpg
            //   http://www.billboard-japan.com/scale/news/00000057/57981/image.jpg
            return src.replace(/\/[0-9]+x(?:[0-9]+)?_([^/]*)$/, "/$1");
        }

        if (domain.indexOf("top.tsite.jp") >= 0 &&
            src.indexOf("/contents_image/") >= 0) {
            // http://cdn.top.tsite.jp/static/top/sys/contents_image/038/778/192/38778192_0_sl.jpg
            //   http://cdn.top.tsite.jp/static/top/sys/contents_image/038/778/192/38778192_0.jpg
            // http://cdn.top.tsite.jp/static/top/sys/contents_image/034/410/417/34410417_0_rl.jpg
            //   http://cdn.top.tsite.jp/static/top/sys/contents_image/034/410/417/34410417_0.jpg
            // http://top.tsite.jp/static/top/sys/contents_image/038/780/255/38780255_133963.jpg
            // http://cdn.top.tsite.jp/static/top/sys/contents_image/media_image/035/136/128/35136128_0.jpeg
            //return src.replace(/_sl(\.[^/.]*)$/, "$1");
            return src.replace(/(\/[0-9]+)_[0-9]+(?:_[^/.]+)?(\.[^/.]*)$/, "$1_0$2");
        }

        if (domain === "www.sanspo.com") {
            // http://www.sanspo.com/geino/images/20171108/geo17110807000004-m1.jpg
            //   http://www.sanspo.com/geino/images/20171108/geo17110807000004-p1.jpg
            // http://www.sanspo.com/geino/images/20140818/oth14081805030011-s3.jpg
            //   http://www.sanspo.com/geino/images/20140818/oth14081805030011-p3.jpg
            // http://www.sanspo.com/geino/images/20140818/oth14081805030011-m1.jpg
            //   http://www.sanspo.com/geino/images/20140818/oth14081805030011-p1.jpg
            //
            // p, m, n, s
            // https://sankei2img.durasite.net/images//uploads/creative/image1/111885/20180221_bmw_150x150.jpg
            //   http://www.sankei.com/images/news/180221/lif1802210001-p1.jpg -- unrelated?
            return src.replace(/(\/images\/[0-9]*\/[^/]*-)[a-z]([0-9]+\.[^/.]*)$/, "$1p$2");
        }

        if (domain === "www.sonymusicshop.jp") {
            // https://www.sonymusicshop.jp/img/1/item/SRC/L00/000/SRCL000009658_SHOP__576_320_102400_jpg.jpg?tf=gray
            //   https://www.sonymusicshop.jp/img/1/item/SRC/L00/000/SRCL000009658_SHOP__9999999999999999_9999999999999999_102400_jpg.jpg?tf=gray
            return src.replace(/__[0-9]+_[0-9]+(_[0-9]+_[a-z]+\.[a-z]*)(?:\?.*)?$/, "__9999999999999999_9999999999999999$1");
        }

        if (domain === "prtimes.jp") {
            // https://prtimes.jp/i/13546/1204/thumb/68x45/d13546-1204-280004-0.jpg
            //   https://prtimes.jp/i/13546/1204/original/d13546-1204-280004-0.jpg
            // https://prtimes.jp/i/13546/826/resize/d13546-826-654115-3.jpg
            //   https://prtimes.jp/i/13546/826/original/d13546-826-654115-3.jpg
            return src
                .replace(/\/thumb\/[0-9]+x[0-9]+\//, "/original/")
                .replace(/\/resize\/([^/]*)$/, "/original/$1");
        }

        if (domain.indexOf(".vietbao.vn") >= 0) {
            // http://vietbao.vn/The-gioi-giai-tri/Hot-girl-Le-Huyen-Anh-Mong-xuan-nay-co-nguoi-som-hoi-cuoi/2147799797/235/ - article
            // http://img.vietbao.vn/images/280/vn888/hot/v2014/cropping-1518416661-27540512-1833666450263816-461803420186171326-n.jpeg
            //   http://img.vietbao.vn/images/0/vn888/hot/v2014/cropping-1518416661-27540512-1833666450263816-461803420186171326-n.jpeg - larger, not full
            //      http://a9.vietbao.vn/images/vn888/hot/v2014/cropping-1518416661-27540512-1833666450263816-461803420186171326-n.jpeg - same
            //
            //   http://img.vietbao.vn/images/0/vn999/upload/hangct/27540512_1833666450263816_461803420186171326_n.jpg - full
            //      http://a9.vietbao.vn/images/vn999/upload/hangct/27540512_1833666450263816_461803420186171326_n.jpg - orig
            //
            // http://vietbao.vn/The-gioi-giai-tri/Thieu-gia-giau-nhat-Trung-Quoc-lao-dao-vi-tin-chong-lung-tang-sieu-xe-tien-ty-cho-Tara/55932319/235/ - article
            // http://a9.vietbao.vn/images/vn888/hot/v2014/cropping-1515483333-nhat-trung-quoc-lao-dao-vi-tin-chong-lung-tang-sieu-xe-tien-ty-cho-t-ara-1.jpeg
            //   http://a9.vietbao.vn/images/vn999/55/2018/01/20180109-ia-giau-nhat-trung-quoc-lao-dao-vi-tin-chong-lung-tang-sieu-xe-tien-ty-cho-t-ara-1.jpg
            return src
                //.replace(/\/images\/[0-9]+\//, "/images/0/")
                .replace(/:\/\/img\.vietbao\.vn\/images\/[0-9]+\//, "://a9.vietbao.vn/images/");
        }

        if (domain === "www.vir.com.vn") {
            // http://www.vir.com.vn/stores/news_dataimages/hung/022018/22/09/in_article/croped/fred-gives-shakhtar-edge-over-roma.jpg
            //   http://www.vir.com.vn/stores/news_dataimages/hung/022018/22/09/fred-gives-shakhtar-edge-over-roma.jpg
            return src
                .replace(/\/in_article\//, "/")
                .replace(/\/croped\//, "/");
        }

        if (domain === "media.tinnong.net.vn") {
            // http://media.tinnong.net.vn/uploaded/Images/Thumb/2018/02/22/Toi_dau_don_roi_bo_anh_de_den_voi_mot_nguoi_khong_binh_thuong_vi_mot_chu_hieu2_2202144833.jpg
            //   http://media.tinnong.net.vn/uploaded/Images/Original/2018/02/22/Toi_dau_don_roi_bo_anh_de_den_voi_mot_nguoi_khong_binh_thuong_vi_mot_chu_hieu2_2202144833.jpg
            return src.replace(/\/Images\/[^/]*\//, "/Images/Original/");
        }

        if (domain === "images.kienthuc.net.vn") {
            // http://images.kienthuc.net.vn/zoomh/500/uploaded/nguyenvan/2018_02_22/vang/vang-1_CUMV.jpg
            //   http://images.kienthuc.net.vn/uploaded/nguyenvan/2018_02_22/vang/vang-1_CUMV.jpg
            return src.replace(/\/zoom[a-z]\/[0-9]*\//, "/");
        }

        if (domain === "rez.cdn.kul.vn") {
            // http://rez.cdn.kul.vn/media/cache/thumbnail_16x10_672x420/uploads/media/thumbnail/59db/29/thumbnail_16x9_t-ara4.jpg
            //   http://rez.cdn.kul.vn/uploads/media/kul/59db/28/kul_news_t-ara4.jpg
            return src.replace(/\/media\/cache\/[^/]*\//, "/");
        }

        if (domain === "static.kstyle.com") {
            // http://static.kstyle.com/stf/ad622b862613fa27895446d446bca918.jpg/r.580x0
            //   http://static.kstyle.com/stf/ad622b862613fa27895446d446bca918.jpg
            return src.replace(/\/r\.[0-9]+x[0-9]+$/, "");
        }

        if (domain === "lifesite-cache.s3.amazonaws.com") {
            // https://lifesite-cache.s3.amazonaws.com/images/made/images/remote/https_s3.amazonaws.com/lifesite/man_and_woman_arguing_with_signs_810_500_55_s_c1.jpg
            //   https://s3.amazonaws.com/lifesite/man_and_woman_arguing_with_signs.jpg
            // https://lifesite-cache.s3.amazonaws.com/images/made/images/remote/https_s3.amazonaws.com/lifesite/Billy_Graham__finger_pointing_720_470_55_s_c1.jpg
            //   https://s3.amazonaws.com/lifesite/Billy_Graham__finger_pointing.jpg
            return src
                .replace(/.*\/images\/remote\/([^_]*)_(.*)_[0-9]+_[0-9]+_[0-9]+_[a-z]_[a-z][0-9](\.[^/.]*)$/, "$1://$2$3");
        }

        if (domain.indexOf(".fap.to") >= 0) {
            // http://x3.fap.to/images/thumb/62/114/1146416891.jpg
            //   http://x3.fap.to/images/full/62/114/1146416891.jpg
            return src.replace(/\/images\/[a-z]*\//, "/images/full/");
        }

        if (domain === "www.gannett-cdn.com" &&
            src.indexOf("/-ip-/") >= 0) {
            // https://www.gannett-cdn.com/-ip-/https://media.gannett-cdn.com/29906170001/29906170001_5720100432001_5720093419001-vs.jpg?pubId=29906170001&quality=10
            //   https://media.gannett-cdn.com/29906170001/29906170001_5720100432001_5720093419001-vs.jpg
            return src.replace(/.*?\/-ip-\//, "");
        }

        if (domain === "cdn.mainichi.jp") {
            // https://cdn.mainichi.jp/vol1/2018/02/19/20180219p2g00m0sp060000p/4.jpg
            //   https://cdn.mainichi.jp/vol1/2018/02/19/20180219p2g00m0sp060000p/9.jpg
            return src.replace(/\/[0-9]+(\.[^/.]*)$/, "/9$1");
        }

        if (domain === "img.evbuc.com") {
            // forces download?
            // https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F37338904%2F45878487997%2F1%2Foriginal.jpg?w=1000&rect=0%2C236%2C1890%2C945&s=53555af848d3afd2d9a9b2cb603d9516
            return decodeURIComponent(src.replace(/.*:\/\/[^/]*\/([^?]*).*/, "$1"));
        }

        if (domain === "img.cdandlp.com") {
            // https://img.cdandlp.com/2017/08/imgL/118890893.jpg
            // https://img.cdandlp.com/2017/08/imgS/118890893.jpg
            // https://img.cdandlp.com/img_ssl/1274211304-73249-1.jpg
            // https://ring.cdandlp.com/sleazyx/photo_grande/115030078-3.jpg
            // https://content.cdandlp.com/superflyrecords/catalogue/40106.jpg
            // https://www.soundfinder.jp/img/products/102065/1507215600/59d727b5-151c-4c14-8768-62417697bade/1180602.jpg
            // https://img.cdandlp.com/2014/09/imgM/117153395.jpg
            return src.replace("/imgS/", "/imgL/").replace("/imgM/", "/imgL/");
        }

        if (domain === "walter.trakt.tv") {
            // https://walter.trakt.tv/images/shows/000/082/248/fanarts/thumb/04342b5daf.jpg.webp
            //   https://walter.trakt.tv/images/shows/000/082/248/fanarts/full/04342b5daf.jpg.webp
            return src.replace(/\/thumb\/([^/]*)$/, "/full/$1");
        }

        if (domain === "cdn.apk-cloud.com") {
            // http://cdn.apk-cloud.com/detail/screenshot/sYpEJNqANEbHAkHjLbYOOdRyn3sIhEtHgF8qSEpKXE38UR0RpI4X7b2eQfTQIiiljCrL.png
            // http://cdn.apk-cloud.com/detail/screenshot/sYpEJNqANEbHAkHjLbYOOdRyn3sIhEtHgF8qSEpKXE38UR0RpI4X7b2eQfTQIiiljCrL=h400.png
            return src
                .replace(/(?:=[a-z][0-9]*)?(\.[^/.]*)$/, "=h0$1");
        }

        if (domain.indexOf(".polyvoreimg.com") >= 0) {
            // https://ak2.polyvoreimg.com/cgi/img-thing/size/l/tid/3884489.jpg
            //   https://www.polyvore.com/cgi/img-thing?.out=jpg&size=l&tid=3884489
            // https://cfc.polyvoreimg.com/cgi/img-set/.sig/9ndQlKC89OQ6ut3OULMg/cid/230139023/id/tsrtpPy65xGAdEGMmAc2pA/size/c1024x1024.jpg
            //   https://cfc.polyvoreimg.com/cgi/img-set/cid/230139023/id/tsrtpPy65xGAdEGMmAc2pA/size/c1024x1024.jpg
            //   https://cfc.polyvoreimg.com/cgi/img-set/cid/230139023/size/c1024x1024.jpg
            //   https://www.polyvore.com/cgi/img-set?.out=jpg&.sig=9ndQlKC89OQ6ut3OULMg&cid=230139023&id=tsrtpPy65xGAdEGMmAc2pA&size=c1024x1024
            // http://ak2.polyvoreimg.com/cgi/img-set/cid/39051735/id/XHw8HlYH4RGZj34mPmiMmg/size/y.jpg
            // http://ak2.polyvoreimg.com/cgi/img-set/cid/39051735/size/y.jpg
            // y, x, e, l, g, m, s, t
            var cginame = src.replace(/.*\/cgi\/([^/]*)\/.*/, "$1");
            var paramsbase = src.replace(/.*\/cgi\/[^/]*/, "");
            var params = paramsbase.replace(/\/([^/]*)\/([^/]*)/g, "$1=$2&");
            params = params
                .replace(/(.*)\.([^/.&]*)&$/, ".out=$2&$1");
            return "https://www.polyvore.com/cgi/" + cginame + "?" + params;
        }

        if (domain === "www.polyvore.com" &&
            src.indexOf("/cgi/") >= 0) {
            // https://www.polyvore.com/cgi/img-thing?.out=jpg&size=l&tid=95293327
            //   https://www.polyvore.com/cgi/img-thing?.out=jpg&size=y&tid=95293327
            // https://www.polyvore.com/cgi/img-set?.out=jpg&.sig=9ndQlKC89OQ6ut3OULMg&cid=230139023&id=tsrtpPy65xGAdEGMmAc2pA&size=c1024x1024
            //   https://www.polyvore.com/cgi/img-set?.out=jpg&.sig=9ndQlKC89OQ6ut3OULMg&cid=230139023&id=tsrtpPy65xGAdEGMmAc2pA&size=c99999x99999
            return src
                .replace(/\/img-set(.*?)&size=[^&]*/, "/img-set$1&size=c99999x99999")
                .replace(/\/img-thing(.*?)&size=[^&]*/, "/img-thing$1&size=y");
        }

        if (domain === "aliyun-cdn.hypebeast.cn" &&
            src.indexOf("/hypebeast.com/") >= 0) {
            // https://aliyun-cdn.hypebeast.cn/hypebeast.com/wp-content/blogs.dir/4/files/2018/01/louis-vuitton-2018-fall-winter-50.jpg?q=75&w=400
            return src.replace(/.*:\/\/[^/]*\//, "http://");
        }

        if (domain === "www.buro247.mn") {
            // http://www.buro247.mn/thumb/1000x700/local/images/buro/galleries/2018/01/_VUI0653.jpg
            //   http://www.buro247.mn/local/images/buro/galleries/2018/01/_VUI0653.jpg
            // https://www.buro247.kz/thumb/125x185/galleries/2018/01/Vuitton%20m%20RF18%201109.jpg -- doesn't work (not .mn though)
            return src.replace(/\/thumb\/[0-9]+x[0-9]+\//, "/");
        }

        if (domain === "www.elle.rs") {
            // http://www.elle.rs/files.php?file=images/2018/01/kate_i_naomi_na_reviji_1_169904615.jpg
            // http://www.elle.rs/thumbnail.php?file=images/2018/02/gucci_moschino_fall_winter_2018_abs___983890735.jpg&size=summary_large
            //   http://www.elle.rs/files.php?file=images/2018/02/gucci_moschino_fall_winter_2018_abs___983890735.jpg
            return src.replace(/\/thumbnail.php.*?file=([^&]*).*/, "/files.php?file=$1");
        }

        if (domain === "www.zkpm.net") {
            // http://www.zkpm.net/img.php?url=http://mmbiz.qpic.cn/mmbiz_jpg/Hey2N7g1r13EPyvv9cxxvy7uYsT9NZuAkbahJGeFoQGO9r0Wwicu7Oh2YiceaMgfObxznBkn4hx61JzCYnwWwMNA/0?wx_fmt=jpeg
            return src.replace(/.*\/img\.php.*?url=(.*)/, "$1");
        }

        if (domain === "img.xiaohuazu.com") {
            // http://img.xiaohuazu.com/?tag=a&url=mmbizz-zqpicz-zcn/mmbiz_jpg/bm1gUegOAnjmwzCcibTuzlH2uqYZnAgPqZHUjew7icxAIAGIkfUdxFaBMuGs5wVEiboyXw4dS94DHATt6ibPhgCK1Q/0?wx_fmt=jpeg
            //   http://mmbiz.qpic.cn/mmbiz_jpg/bm1gUegOAnjmwzCcibTuzlH2uqYZnAgPqZHUjew7icxAIAGIkfUdxFaBMuGs5wVEiboyXw4dS94DHATt6ibPhgCK1Q/0?wx_fmt=jpeg
            return src.replace(/.*?[?&]url=(.*)/, "$1").replace(/z-z/g, ".").replace(/^/, "http://");
        }

        if (domain === "www.viewsofia.com") {
            // https://www.viewsofia.com/upload/fck_editor_thumb/fck_editor/Image/LV18/_VUI0653.jpg
            //   https://www.viewsofia.com/upload/fck_editor/fck_editor/Image/LV18/_VUI0653.jpg
            return src.replace("/fck_editor_thumb/", "/fck_editor/");
        }

        if (domain.indexOf(".static.media.condenast.ru") >= 0) {
            // https://d6.static.media.condenast.ru/vogue/collection/49d7fa92bdcb9696c7ebac700ca6983e.jpg/0ce73d99/o/t214x320
            // http://static.glamour.ru/iblock/d4c/71048307.jpg
            return src.replace(/\/[a-z][0-9]*(?:x[0-9]+)?$/, "/w99999999");
        }

        if (domain === "www.vogue.co.jp") {
            // https://www.vogue.co.jp/uploads/media/2017/01/25/ALEXANDRE_VAUTHIER_2017SS_Haute_Couture_Collection_runway_gallery-26-171-256.jpg
            //   https://www.vogue.co.jp/uploads/media/2017/01/25/ALEXANDRE_VAUTHIER_2017SS_Haute_Couture_Collection_runway_gallery-26.jpg
            return src.replace(/-[0-9]+-[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain === "cdn.vogue.mx") {
            // http://cdn.vogue.mx/uploads/images/thumbs/mx/vog/2/c/2017/04/alexandre_vauthier_pasarela_387309230_377x566.jpg
            //   http://cdn.vogue.mx/uploads/images/thumbs/mx/vog/2/c/2017/04/alexandre_vauthier_pasarela_387309230_1200x1800.jpg
            //   http://cdn.vogue.mx/uploads/images/mx/vog/c/2017/04/alexandre_vauthier_pasarela_170811342.jpg
            // http://cdn.vogue.mx/uploads/images/thumbs/mx/vog/2/c/2017/04/alexandre_vauthier_pasarela_170811342_185x278.jpg
            //   http://cdn.vogue.mx/uploads/images/mx/vog/c/2017/04/alexandre_vauthier_pasarela_170811342.jpg
            // http://cdn.vogue.mx/uploads/images/mx/vog/s/2016/10/familia_real_britanica_780685680.jpg
            return src
                .replace(/\/thumbs\/mx\/vog\/[0-9]*\/(.*)_[0-9]+x[0-9]+(\.[^/.]*)$/, "/mx/vog/$1$2");
        }

        if (domain.match(/\.ykt[0-9]*\.ru$/)) {
            // http://cs-msk-fd-4.ykt2.ru/media/upload/photo/2015/11/16/thumb/561772143a52dw350h530cr.jpeg
            // http://www.news.ykt.ru/upload/image/2017/04/55619/thumb/58ec2ea7219bd.jpg
            return src.replace(/\/thumb\/([^/]*)$/, "/$1");
        }

        if (domain === "i.guim.co.uk") {
            // https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/6/2/1401727592551/Jeremy-Paxman--014.jpg
            // https://i.guim.co.uk/img/media/25e99cf42defaf460da04eb3fa08fac1f10aac55/0_138_3500_2100/master/3500.jpg?w=600&q=20&auto=format&usm=12&fit=max&dpr=2&s=5366bc1d02c96c9062f7c1c19318626f
            //   https://media.guim.co.uk/25e99cf42defaf460da04eb3fa08fac1f10aac55/0_138_3500_2100/master/3500.jpg
            // https://i.guim.co.uk/img/static/sys-images/Guardian/Pix/pictures/2015/2/18/1424261816248/34329776-7c4a-488a-a767-57ee9477cad3-2060x1236.jpeg
            //   https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2015/2/18/1424261816248/34329776-7c4a-488a-a767-57ee9477cad3-2060x1236.jpeg
            return src.replace(/:\/\/[^/]*\/img\/([^/]*)\/([^?]*).*?$/, "://$1.guim.co.uk/$2");
        }

        if (domain === "media.guim.co.uk") {
            // https://media.guim.co.uk/25e99cf42defaf460da04eb3fa08fac1f10aac55/0_138_3500_2100/master/3500.jpg
            //   https://media.guim.co.uk/25e99cf42defaf460da04eb3fa08fac1f10aac55/0_138_3500_2100/3500.jpg
            return src.replace(/\/((?:[0-9]*_){3}[0-9]*)\/[^/]*\/([0-9]*\.[^/.]*)$/, "/$1/$2");
        }

        if (domain === "www.myproana.com") {
            // http://www.myproana.com/uploads/gallery/album_28122/med_gallery_463850_28122_30414.jpg
            return src.replace(/\/med_([^/]*)$/, "/$1");
        }

        if (domain === "vogue.gjstatic.nl") {
            // https://vogue.gjstatic.nl/thumbnails/GenjArticleBundle/Article/fileUpload/medium/00/58/12/dit-heeft-gigi-hadid-te-zeggen-tegen-al-haar-body-shamers-5812.jpg
            // https://vogue.gjstatic.nl/thumbnails/GenjArticleBundle/Article/fileUpload/detail/01/06/15/glitter-sparkle-shine-alexa-chung-staat-op-de-cover-van-vogue-december-2017-10615.jpg
            // https://vogue.gjstatic.nl/uploads/media/image/dolce-gabbana-make-capri-a-paparazzi-free-zone_9.jpg
            // https://vogue.gjstatic.nl/uploads/media/image/singer-songwriter-angela-vertelt-de-californie-hea-1.jpg
            // https://vogue.gjstatic.nl/thumbnails/GenjArticleBundle/Article/teaserFileUpload/teaser/00/84/17/tommy-x-gigi-has-landed-dit-zijn-vogue-s-favorieten-uit-de-ultieme-cali-girl-collectie-8417.jpg
            //   https://vogue.gjstatic.nl/thumbnails/GenjArticleBundle/Article/fileUpload/detail/00/84/17/tommy-x-gigi-has-landed-dit-zijn-vogue-s-favorieten-uit-de-ultieme-cali-girl-collectie-8417.jpg
            // https://vogue.gjstatic.nl/thumbnails/GenjArticleBundle/Article/fileUpload/detail/00/89/30/gigi-hadid-verlengt-samenwerking-met-tommy-hilfiger-8930.jpg
            //   https://vogue.gjstatic.nl/thumbnails/GenjArticleBundle/Article/fileUpload/big/00/89/30/gigi-hadid-verlengt-samenwerking-met-tommy-hilfiger-8930.jpg
            // https://designer-vintage.gjstatic.nl/thumbnails/GenjArticleBundle/Article/fileUpload/detail/00/19/42/the-top-5-best-snow-white-winter-bags-1942.jpg
            // https://designer-vintage.gjstatic.nl/uploads/media/image/the-exclusive-designer-vintage-summer-sale.jpg
            // https://designer-vintage.gjstatic.nl/thumbnails/GenjArticleBundle/Article/fileUpload/detail/00/13/27/the-exclusive-designer-vintage-summer-sale-1327.jpg
            return src
                .replace(/\/teaserFileUpload\//, "/fileUpload/") // doesn't work on all
                .replace(/\/fileUpload\/[^/]*\//, "/fileUpload/big/");
        }

        if (domain.match(/s[0-9]*\.favim\.com/)) {
            // https://s10.favim.com/mini/171202/book-Favim.com-5265965.jpeg
            //   https://s10.favim.com/orig/171202/book-Favim.com-5265965.jpeg
            // https://s8.favim.com/mini/151114/girls-generation-icons-snsd-taeyeon-Favim.com-3566828.png
            //   https://s8.favim.com/orig/151114/girls-generation-icons-snsd-taeyeon-Favim.com-3566828.png
            return src.replace(/(:\/\/[^/]*\/)[^/]*\//, "$1orig/");
        }

        if (domain === "derpicdn.net") {
            // https://derpicdn.net/img/2018/2/24/1664344/thumb.png
            //   https://derpicdn.net/img/2018/2/24/1664344/full.png
            return src.replace(/\/thumb(\.[^/.]*)$/, "/full$1");
        }

        if (domain.indexOf(".iimg.me") >= 0) {
            // http://mnetjapan.iimg.me/interest.php?url=http%3A%2F%2Fjp.mnet.com%2Fdata%2Fwww.mnetjapan.com%2Fadmin%2F000%2F172%2F494
            //   http://jp.mnet.com/data/www.mnetjapan.com/admin/000/172/494
            // http://s.iimg.me/profile.php?url=http%3A%2F%2Fs.iimg.me%2FprofileImage%2Fg%2F9%2F98g_1423385594_profile
            newsrc = src.replace(/.*\/[a-z]*\.php.*?[?&]url=([^&]*).*?$/, "$1");
            if (newsrc !== src && newsrc.indexOf("http") === 0) {
                return decodeURIComponent(newsrc);
            }
        }

        if (domain === "pix.avaxnews.com") {
            // http://pix.avaxnews.com/avaxnews/99/e2/0002e299_medium.jpeg
            //   http://pix.avaxnews.com/avaxnews/99/e2/0002e299.jpeg
            // https://pix.avaxnews.com/avaxnews/9c/e2/0002e29c_medium.jpeg
            //   https://pix.avaxnews.com/avaxnews/9c/e2/0002e29c.jpeg
            return src.replace(/_[^/]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "i.hurimg.com") {
            // http://i.hurimg.com/i/hdn/10/100x0/5a8becad18c7731320697a39.jpg
            //   http://i.hurimg.com/i/hdn/100/0x0/5a8becad18c7731320697a39.jpg
            return src.replace(/\/i\/hdn\/[0-9]+\/[0-9]+x[0-9]+\//, "/i/hdn/100/0x0/");
        }

        if (domain === "www.kurtkomaromi.com") {
            // http://www.kurtkomaromi.com/.a/6a00d8341c764653ef01b8d144082f970c-500wi
            //   http://www.kurtkomaromi.com/.a/6a00d8341c764653ef01b8d144082f970c
            return src.replace(/(\/\.a\/[^-/]*)-[^/]*$/, "$1");
        }

        if (domain === "img.jakpost.net") {
            // http://img.jakpost.net/c/2017/08/11/2017_08_11_30875_1502421112._small.jpg
            return src.replace(/\.[^/.]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "r.ddmcdn.com") {
            // http://r.ddmcdn.com/w_1330/s_f/o_1/cx_0/cy_0/cw_1330/ch_1995/TLC/uploads/2016/03/SYTTD_ep1407_051.jpg
            //   http://r.ddmcdn.com/cx_0/cy_0/cw_0/ch_0/TLC/uploads/2016/03/SYTTD_ep1407_051.jpg
            //   http://static.ddmcdn.com/TLC/uploads/2016/03/SYTTD_ep1407_051.jpg
            // http://r.ddmcdn.com/s_f/o_1/APL/uploads/2015/11/pangolin-ARTICLE-PAGE.jpg
            //   http://static.ddmcdn.com/APL/uploads/2015/11/pangolin-ARTICLE-PAGE.jpg
            // http://r.ddmcdn.com/w_2574/s_f/o_1/cx_7/cy_0/cw_2574/ch_1716/DSC/uploads/2015/01/mythbusters-228-07.jpg
            //   http://static.ddmcdn.com/DSC/uploads/2015/01/mythbusters-228-07.jpg
            return src.replace(/:\/\/[^/]*\/(?:[^/_]*_[^/_]*\/)*/, "://static.ddmcdn.com/");
        }

        if (domain.match(/images[0-9]*\.newegg\.com/)) {
            // https://images10.newegg.com/ProductImageCompressAll300/A24G_131515246497615592Gsxgghs342.jpg
            //   https://images10.newegg.com/ProductImageOriginal/A24G_131515246497615592Gsxgghs342.jpg
            // https://images10.newegg.com/NeweggImage/ProductImage/11-129-212-Z01.jpg
            //   https://images10.newegg.com/NeweggImage/ProductImageCompressAll1280/11-129-212-Z01.jpg
            //   https://images10.newegg.com/ProductImageOriginal/11-129-212-Z01.jpg
            // https://images10.newegg.com/NeweggImage/productimage/11-154-087-13.jpg
            //   https://images10.newegg.com/ProductImageOriginal/11-154-087-13.jpg
            // ignore:
            // https://images10.newegg.com/BizIntell/item/11/129/11-129-209/a6_120817.jpg
            return src.replace(/(:\/\/[^/]*\/)(?:NeweggImage\/)?(?:ProductImage|productimage)[^/]*\//, "$1ProductImageOriginal/");
        }

        if (domain === "images.costco-static.com" ||
            domain.match(/images\.costcobusinesscentre\..*/)) {
            // https://images.costco-static.com/ImageDelivery/imageService?profileId=12026539&imageId=1660214-894__1&recipeName=350
            //   https://images.costco-static.com/ImageDelivery/imageService?profileId=12026539&imageId=1660214-894__1
            // https://images.costcobusinesscentre.ca/ImageDelivery/imageService?profileId=12027981&imageId=1030100__1&recipeName=350
            //   https://images.costcobusinesscentre.ca/ImageDelivery/imageService?profileId=12027981&imageId=1030100__1
            return src
                .replace(/([?&])recipeName=[^&]*/, "$1")
                .replace(/&$/, "");
        }

        if (domain === "emerge-tech.s3.amazonaws.com") {
            // https://emerge-tech.s3.amazonaws.com/content/thumb/24764608_main_thumb.jpeg
            //   https://emerge-tech.s3.amazonaws.com/content/full/24764608_main_full.jpeg
            return src.replace(/\/[a-z]*\/([0-9]*_[a-z]*_)[a-z]*(\.[^/.]*)$/, "/full/$1full$2");
        }

        if (domain.match(/img[0-9]*(?:-[^.]*)?\.wfcdn\.com/)) {
            // https://secure.img1-fg.wfcdn.com/im/46823086/resize-h800%5Ecompr-r85/1292/12924520/Water+Resistant+Combination+Security+Safe+with+Dial+/+Combination/Key/Dual-Lock.jpg
            //   https://secure.img1-fg.wfcdn.com/im/46823086/compr-r85/1292/12924520/Water+Resistant+Combination+Security+Safe+with+Dial+/+Combination/Key/Dual-Lock.jpg
            // https://secure.img1-fg.wfcdn.com/lf/maxsquare/hash/11510/9457200/1/Waverly-Imperial-Dress-Porcelain-50-Curtain-Valance.jpg
            return src.replace(/(\/im\/[0-9]+\/)[^/]*\//, "$1compr-r85/");
        }

        if (domain.indexOf(".hdnux.com") >= 0) {
            // https://s.hdnux.com/photos/71/36/40/15067141/3/1024x1024.jpg
            //   https://s.hdnux.com/photos/71/36/40/15067141/3/rawImage.jpg
            // http://ww2.hdnux.com/photos/70/63/07/14889457/3/1024x1024.jpg
            // https://s.hdnux.com/photos/70/63/07/14889457/3/1024x1024.jpg
            return src.replace(/\/[0-9]+x[0-9]+(\.[^/.]*)$/, "/rawImage$1");
        }

        if (domain.match(/news[0-9]*\.busan\.com/)) {
            // http://news20.busan.com/content/image/2018/02/28/20180228000313_t.jpg
            //   http://news20.busan.com/content/image/2018/02/28/20180228000313_0.jpg
            return src.replace(/_t(\.[^/.]*)$/, "_0$1");
        }

        if (domain.indexOf(".amazonaws.com") >= 0 &&
            src.indexOf("/bucket.scribblelive.com/") >= 0) {
            // http://s3.amazonaws.com/bucket.scribblelive.com/12554/2016/6/27/9509e65e-3508-415c-9517-e378eec731b9_1000.jpg
            //   http://s3.amazonaws.com/bucket.scribblelive.com/12554/2016/6/27/9509e65e-3508-415c-9517-e378eec731b9.jpg
            return src.replace(/_[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain === "cdn.images.express.co.uk" && false) {
            // wip
            // https://cdn.images.express.co.uk/img/dynamic/mps/110x120/Barry-McElduff.jpg
            // https://cdn.images.express.co.uk/img/dynamic/79/590x/secondary/Sophie-Turner-295434.jpg - 590x832
            // https://cdn.images.express.co.uk/img/dynamic/59/590x/secondary/windows-10-creators-update-security-centre-settings-884921.png - 5464x2912
            // https://cdn.images.express.co.uk/img/dynamic/galleries/x701/45523.jpg
        }

        if (domain === "www.dhresource.com") {
            // https://www.dhresource.com/webp/m/100x100/f2/albu/g5/M01/44/8F/rBVaI1mBeuGAZgrYAAERdzyHfFk078.jpg
            //   https://www.dhresource.com/0x0/f2/albu/g5/M01/44/8F/rBVaI1mBeuGAZgrYAAERdzyHfFk078.jpg
            return src.replace(/(:\/\/[^/]*\/)[^/]*\/[^/]*\/[0-9]+x[0-9]+\//, "$10x0/")
        }

        if (domain === "storify.com" &&
            src.indexOf("/services/proxy/") >= 0) {
            // https://storify.com/services/proxy/2/X3vpwL2T19SKqyTM4tGayg/http/www.navy.mil/management/photodb/photos/131112-N-TG831-184.JPG
            //   http://www.navy.mil/management/photodb/photos/131112-N-TG831-184.JPG
            // https://storify.com/services/proxy/2/zCwCS2c37byorPhrTXxeJQ/https/pbs.twimg.com/media/CnHZuSZWIAAfesh.jpg:large
            return src.replace(/.*\/services\/proxy\/[0-9]+\/[^/]*\/([a-z]+)\/(.*)$/, "$1://$2");
        }

        if (domain === "www.mbcsportsplus.com") {
            // http://www.mbcsportsplus.com/images/img.php?srv=1&type=m&src=/201803/99908540_2018030209204161.jpg&gImg=1&refresh=&w=300
            //   http://www.mbcsportsplus.com/data/home/data/msplMain/201803/99908540_2018030209204161.jpg
            if (src.match(/[?&]type=m[^a-z0-9A-Z]/))
                return src.replace(/\/images\/img\.php.*?[?&]src=([^&]*).*/, "/data/home/data/msplMain");
        }

        if (domain.match(/s[0-9]*cdn\.joomag\.com/)) {
            // https://view.joomag.com/%EB%85%84-%EC%9B%94%ED%98%B8-maxim%EB%A7%A5%EC%8B%AC-%ED%91%9C%EC%A7%80%EB%AA%A8%EB%8D%B8-%EB%A0%88%EC%9D%B8%EB%B3%B4%EC%9A%B0-%EC%A7%80%EC%88%99-%EC%B5%9C%ED%98%84%EC%84%9D-new-07-2015/0970864001438089053
            // https://s2cdn.joomag.com/mobile/0/548/548615/102_1-0.PNG?.1520177124
            //   https://s2cdn.joomag.com/mobile/0/548/548615/102_0-0.PNG?.1520177124
            //   https://www.joomag.com/Frontend/WebService/getPageCopy.php?uID=0/548/548615/102_0-0.PNG
            // https://s2cdn.joomag.com/res_mag/0/305/305387/548615/thumbs/spread/102.jpg?1458945882
            //   https://s2cdn.joomag.com/res_mag/0/305/305387/548615/thumbs/spread/101.jpg?1458945882 - 101 == 102
            return src.replace(/(\/mobile\/.*\/[0-9]+_)[0-9]+(-[0-9]*\.[^/]*)$/, "$10$2");
        }

        if (domain === "i.pximg.net" && false) {
            // only works if the referrer is correct
            // https://i.pximg.net/c/600x600/img-master/img/2017/06/25/17/53/43/63558968_p0_master1200.jpg
            //   https://i.pximg.net/img-original/img/2017/06/25/17/53/43/63558968_p0.jpg
            // https://i.pximg.net/c/600x600/img-master/img/2017/06/10/23/13/15/63320604_p0_master1200.jpg
            //   https://i.pximg.net/c/600x600/img-master/img/2017/06/10/23/13/15/63320604_p0_master1200.jpg
            // https://i.pximg.net/c/600x600/img-master/img/2017/06/10/23/13/15/63320604_p0_master1200.jpg
            //   https://i.pximg.net/img-original/img/2017/06/10/23/13/15/63320604_p0.jpg
            //   https://i.pximg.net/img-original/img/2017/06/10/23/13/15/63320604_p0.jpg
            //   referer: https://www.pixiv.net/member_illust.php?mode=medium&illust_id=63320604
        }

        if (domain === "cache-graphicslib.viator.com") {
            // http://cache-graphicslib.viator.com/graphicslib/media/e0/mt-vesuvius-photo_987616-770tall.jpg
            //   http://cache-graphicslib.viator.com/graphicslib/media/e0/mt-vesuvius-photo_987616-raw.jpg
            // https://cache-graphicslib.viator.com/graphicslib/thumbs360x240/2958/SITours/naples-shore-excursion-mt-vesuvius-half-day-trip-from-naples-in-naples-45216.jpg
            //   https://cache-graphicslib.viator.com/graphicslib/thumbs674x446/2958/SITours/naples-shore-excursion-mt-vesuvius-half-day-trip-from-naples-in-naples-45216.jpg
            //   https://cache-graphicslib.viator.com/graphicslib/2958/SITours/naples-shore-excursion-mt-vesuvius-half-day-trip-from-naples-in-naples-45216.jpg -- smaller
            // https://cache-graphicslib.viator.com/graphicslib/mm/28/the-original-london-sightseeing-tour-hop-on-hop-off-156128-raw.jpg
            // https://cache-graphicslib.viator.com/graphicslib/mm/83/i-amsterdam-card-city-pass-for-amsterdam-155183-raw.jpg
            return src.replace(/([-_][0-9]+)-[^-_/.]*(\.[^/.]*)$/, "$1-raw$2");
        }

        if (domain === "igx.4sqi.net") {
            // https://igx.4sqi.net/img/general/200x200/14154508__KFDGWAVvjjTcK6pEKNuQER_10kmzcBR7eU3BWbYGG4.jpg
            //   https://igx.4sqi.net/img/general/original/14154508__KFDGWAVvjjTcK6pEKNuQER_10kmzcBR7eU3BWbYGG4.jpg
            return src.replace(/\/img\/general\/[^/]*\//, "/img/general/original/");
        }

        if (domain === "static.panoramio.com" ||
            domain === "static.panoramio.com.storage.googleapis.com") {
            // http://static.panoramio.com/photos/small/6106783.jpg
            // http://static.panoramio.com/photos/large/6106783.jpg
            // http://static.panoramio.com/photos/original/6106783.jpg
            // https://static.panoramio.com.storage.googleapis.com/photos/large/8327198.jpg
            return src.replace(/\/photos\/[^/]*\//, "/photos/original/");
        }

        if (domain.match(/.*cdn.*\.myportfolio\.com$/)) {
            // https://pro2-bar-s3-cdn-cf.myportfolio.com/4b7b32c34c99b966ad6f0ba84341a0df/8c698e4c5561ed288f2350a6_rw_3840.jpg?h=ec899b0e004e5d1cd5bcf474b259302d
            //   https://pro2-bar-s3-cdn-cf.myportfolio.com/4b7b32c34c99b966ad6f0ba84341a0df/8c698e4c5561ed288f2350a6.jpg
            //   https://pro2-bar.myportfolio.com/v1/assets/4b7b32c34c99b966ad6f0ba84341a0df/8c698e4c5561ed288f2350a6.jpg -- hash is required
            // https://pro2-bar-s3-cdn-cf2.myportfolio.com/fc87a328b5563b3948ee90b56bb47c80/df42aa71-c29a-4ccb-b40d-70e9f87872bf_car_202x158.jpg?h=8332ff2d4ba2a81d4cd8957d4a8f9d85
            //   https://pro2-bar-s3-cdn-cf2.myportfolio.com/fc87a328b5563b3948ee90b56bb47c80/df42aa71-c29a-4ccb-b40d-70e9f87872bf_car_202x158.jpg - still works
            //   https://pro2-bar.myportfolio.com/v1/assets/fc87a328b5563b3948ee90b56bb47c80/df42aa71-c29a-4ccb-b40d-70e9f87872bf_car_202x158.jpg -- hash is required
            //   https://pro2-bar-s3-cdn-cf2.myportfolio.com/fc87a328b5563b3948ee90b56bb47c80/df42aa71-c29a-4ccb-b40d-70e9f87872bf.jpg:
            //     https://pro2-bar.myportfolio.com/v1/assets/fc87a328b5563b3948ee90b56bb47c80/df42aa71-c29a-4ccb-b40d-70e9f87872bf.jpg -- hash is required
            return src.replace(/_rw_[0-9]+(\.[^/.?]*)(?:\?.*)?$/, "$1");
        }

        if (domain === "i.dell.com") {
            // http://i.dell.com/das/xa.ashx/global-site-design%20web/00000000-0000-0000-0000-000000000000/1/LargePNG?id=Dell/Product_Images/Dell_Client_Products/Desktops/Inspiron_Desktops/Inspiron_3250_SFF/global_spi/desktop-inspiron-3250-small-form-factor-black-right-hero-504x350.psd
            //   http://i.dell.com/das/xa.ashx/global-site-design%20web/00000000-0000-0000-0000-000000000000/1/originalpng?id=Dell/Product_Images/Dell_Client_Products/Desktops/Inspiron_Desktops/Inspiron_3250_SFF/global_spi/desktop-inspiron-3250-small-form-factor-black-right-hero-504x350.psd
            // http://i.dell.com/sites/imagecontent/app-merchandizing/responsive/HomePage/en/PublishingImages/22437-home-desktop-inspiron-3650-silver-3656-red-150x120.png
            // http://i.dell.com/das/dih.ashx/189w/das/xa_____/global-site-design%20web/c09863ef-2675-4682-0704-6dc976226db3/1/originalpng?id=Dell/Product_Images/Dell_Client_Products/Desktops/Inspiron_Desktops/Inspiron_3250_SFF/global_spi/desktop-inspiron-3250-small-form-factor-black-left-bestof-500-ng.psd
            // http://si.cdn.dell.com/sites/imagecontent/consumer/merchandizing/en/publishingimages/24031-desktop-inspiron-3268-169x121.png
            return src.replace(/(\/(?:[0-9a-f]+-){4}[0-9a-f]+\/[0-9]+\/)LargePNG/, "$1originalpng");
        }

        if (domain === "thumb.zumst.com") {
            // http://thumb.zumst.com/530x0/http://static.news.zumst.com/images/23/2018/03/09/73abd6e986ec4160b1e9a8459532eed2.jpg
            //   http://static.news.zumst.com/images/23/2018/03/09/73abd6e986ec4160b1e9a8459532eed2.jpg
            // http://news.zum.com/articles/5254413
            //   http://static.news.zum.com/images/18/2013/01/18/20130118_1358493810.jpg - 2132x2845
            return src.replace(/.*:\/\/[^/]*\/[0-9]+[^/]*\//, "");
        }

        if (domain === "file.mk.co.kr") {
            // http://file.mk.co.kr/meet/2018/03/image_listtop_2018_156502_1520579288.jpg.thumb
            //   http://file.mk.co.kr/meet/2018/03/image_listtop_2018_156502_1520579288.jpg - slightly larger
            //   http://file.mk.co.kr/meet/2018/03/image_readtop_2018_156502_1520578294.jpg
            return src
                .replace(/\.thumb$/, "");
        }

        if (domain === "kobis.or.kr") {
            // http://kobis.or.kr/common/mast/movie/2016/04/thumb/thn_4ddde64e76f64663998f4123ae837fcc.jpg
            //   http://kobis.or.kr/common/mast/movie/2016/04/4ddde64e76f64663998f4123ae837fcc.jpg
            return src.replace("/thumb/thn_", "/");
        }

        if (domain === "www.breaknews.com" ||
            domain === "breaknews.com") {
            // http://www.breaknews.com/data/breaknews_com/mainimages/201803/2018020713038427.jpg
            //   http://www.breaknews.com/imgdata/breaknews_com/201802/2018020713038427.jpg
            // http://www.breaknews.com/sub_read.html?uid=488764&section=sc4
            //   http://www.breaknews.com/imgdata/breaknews_com/201701/2017012752287231.jpg - 2000x3159
            // http://breaknews.com/data/breaknews_com/mainimages/201803/2018030742107604.jpg
            // doesn't always work:
            // http://breaknews.com/data/breaknews_com/mainimages/201803/2018030742107604.jpg
            //   http://www.breaknews.com/imgdata/breaknews_com/201803/2018030742107604.jpg -- doesn't work
            //   http://www.breaknews.com/imgdata/breaknews_com/201803/2018030604302058.jpg -- works
            // http://breaknews.com/data/breaknews_com/mainimages/201803/2017090815222839.jpg
            //   http://breaknews.com/imgdata/breaknews_com/201709/2017090815222839.jpg -- works (not a problem with www.)
            return src.replace(/\/data\/([^/]*)\/mainimages\/[0-9]*\/([0-9]{6})/, "/imgdata/$1/$2/$2");
        }

        if (domain === "ilyo.co.kr") {
            // http://ilyo.co.kr/contents/article/images/2015/0306/thm200_1425610033458142.jpg
            //   http://ilyo.co.kr/contents/article/images/2015/0306/1425610033458142.jpg - 1788x2698
            return src.replace(/\/thm[0-9]+_/, "/");
        }

        if (domain === "www.joseilbo.com") {
            // http://www.joseilbo.com/gisa_img_origin/15090052681509005268_yumju423_origin.jpg - 5312x2988
            // http://www.joseilbo.com/gisa_img/1518397320.thumbnail.jpg
            //   http://www.joseilbo.com/gisa_img/1518397320.jpg
            // http://www.joseilbo.com/gisa_img/15199713541519971354_kiruki54.jpg
            //   http://www.joseilbo.com/gisa_img_origin/15199713541519971354_kiruki54_origin.jpg
            // http://www.joseilbo.com/xml/racing/image/6f1f52ac11d533a84f41705a5f09411f.thumbnail.jpg
            //   http://www.joseilbo.com/xml/racing/image/6f1f52ac11d533a84f41705a5f09411f.jpg
            return src
                .replace(/\.thumbnail(\.[^/.]*)$/, "$1")
                .replace(/\/gisa_img\/([0-9]+_[^/._]+)(\.[^/.]*)$/, "/gisa_img_origin/$1_origin$2");
        }

        if (domain.indexOf(".phncdn.com") >= 0) {
            // https://ci.phncdn.com/pics/albums/000/430/541/4503569/(m=eiJ_8b)(mh=EvXtHOjNcliZ7ja0)original_4503569.jpg
            //   https://ci.phncdn.com/pics/albums/000/430/541/4503569/original_4503569.jpg
            return src.replace(/\/(?:\([a-z]+=[^/)]*\))*([^/]*)$/, "/$1");
        }

        if (domain === "img.fril.jp") {
            // https://img.fril.jp/img/102398107/s/288867076.jpg?1506827930
            // l, m, s
            return src.replace(/\/[a-z]\/([^/]*)$/, "/l/$1");
        }

        if (domain === "img.cinematoday.jp") {
            // https://img.cinematoday.jp/a/E0000548/_size_c640x/_v_1337344420/18.JPG
            //   https://img.cinematoday.jp/a/E0000548/_v_1337344420/18.JPG
            // https://img.cinematoday.jp/res/GA/2015/0725_05/v1437812942/DSC_0027-cx.JPG
            //   https://img.cinematoday.jp/res/GA/2015/0725_05/v1437812942/DSC_0027.JPG
            // http://img.cinematoday.jp/res/GA/2014/0712_02/v1405139653/IMG_2930-x.JPG
            // https://img.cinematoday.jp/a/E0010088/_size_1200x/_v_1473853900/19.jpg
            // https://img.cinematoday.jp/res/GA/2015/1028_08/v1446033979/07-0x0.JPG
            //   https://img.cinematoday.jp/res/GA/2015/1028_08/v1446033979/07.JPG
            // http://s.cinematoday.jp/res/N0/04/86/v1355451846/N0048658_l.jpg
            //   http://s.cinematoday.jp/res/N0/04/86/v1355451846/N0048658.jpg -- smaller
            //   https://img.cinematoday.jp/res/N0/04/86/v1355451846/N0048658.jpg -- same
            // https://img.cinematoday.jp/res/GA/2016/0624_01/v1466737624/IMG_1177-560x600.JPG
            // https://img.cinematoday.jp/a/A0005070/_size_/_v_1469826000/11.jpg
            // https://img.cinematoday.jp/a/E0011605/_size_c640x/_v_1499569440/02.jpg
            return src
                .replace(/-[a-z0-9]*x[a-z0-9]*(\.[^/.]*)$/, "$1")
                .replace(/\/_size_[^/]*\//, "/");
        }

        if (domain.indexOf(".seesaa.net") >= 0) {
            // http://flamant.up.seesaa.net/image/1981AAA9-2780-4445-8DF7-C72FA57A6738-thumbnail2.jpg
            //   http://flamant.up.seesaa.net/image/1981AAA9-2780-4445-8DF7-C72FA57A6738.jpg
            return src.replace(/-thumbnail[0-9]*(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf(".biglobe.ne.jp") >= 0) {
            // https://news.biglobe.ne.jp/entertainment/1227/5332001629/nrn_2016-12-27-050012_thum630.jpg
            // https://news.biglobe.ne.jp/animal/0309/8840287090/pec_301481_thum500.png
            // removing thum[0-9]* makes it smaller
        }

        if (domain.match(/media[0-9]*\.ledevoir\.com/)) {
            // http://media2.ledevoir.com/images_galerie/nwl_602637_453756/image.jpg
            //   http://media2.ledevoir.com/images_galerie/nwdp_602637_453756/image.jpg
            // http://media1.ledevoir.com/images_galerie/nwlb_602533_453783/image.jpg
            //   http://media1.ledevoir.com/images_galerie/nwdp_602533_453783/image.jpg
            // http://media2.ledevoir.com/images_galerie/1_453723/le-coup-de-crayon-du-10-mars.jpg
            //   http://media2.ledevoir.com/images_galerie/nwdp_1_453723/le-coup-de-crayon-du-10-mars.jpg
            // http://media1.ledevoir.com/images_galerie/app_1_452365/le-coup-de-crayon-du-7-mars.jpg
            //   http://media1.ledevoir.com/images_galerie/nwdp_1_452365/le-coup-de-crayon-du-7-mars.jpg
            return src.replace(/\/images_galerie\/(?:[^-/._]*_)?([0-9]+_[0-9]+)\//, "/images_galerie/nwdp_$1/");
        }

        if (domain === "infotel.ca") {
            // https://infotel.ca/news/medialibrary/image/hl-mediaitemid50826-1365.jpg
            //   https://infotel.ca/news/medialibrary/image/hd-mediaitemid50826-1365.jpg
            //   https://infotel.ca/news/medialibrary/image/orig-mediaitemid50826-1365.jpg
            return src.replace(/\/medialibrary\/image\/[^-_/.]*-/, "/medialibrary/image/orig-");
        }

        if (domain === "www.eleconomista.com.mx" && src.indexOf("/img/") >= 0) {
            // https://www.eleconomista.com.mx/__export/1518538244604/sites/eleconomista/img/2018/02/13/mario_draghi.jpg_332989735.jpg
            //   https://www.eleconomista.com.mx/__export/1518538244604/sites/eleconomista/img/2018/02/13/mario_draghi.jpg
            return src.replace(/(\/[^/.]*\.[^/._]*)_[^/.]*\.[^/.]*$/, "$1");
        }

        if (domain === "gcm-v2.omerlocdn.com") {
            // https://gcm-v2.omerlocdn.com/production/global/files/image/16c89c8b-58a1-490f-b9a6-323adb16ca75_1024.jpg
            //   https://gcm-v2.omerlocdn.com/production/global/files/image/16c89c8b-58a1-490f-b9a6-323adb16ca75.jpg
            return src.replace(/_[0-9]+(\.[^/.]*)$/, "$1");
        }

        if (domain === "www.dailystar.com.lb") {
            // https://www.dailystar.com.lb/dailystar/Comics/23-02-2018/7cartoon%20New%20maths%20teacher_636549414776995725_main.jpg
            //   https://www.dailystar.com.lb/dailystar/Comics/23-02-2018/7cartoon%20New%20maths%20teacher_636549414776995725.jpg
            // http://www.dailystar.com.lb/dailystar/Pictures/2011/06/27/SaudiSpecialForces03_634448139672228001_img900x550_img900x550_crop.jpg
            //   http://www.dailystar.com.lb/dailystar/Pictures/2011/06/27/SaudiSpecialForces03_634448139672228001.jpg
            // http://www.dailystar.com.lb/dailystar/Pictures/2011/05/06/Mirna-Chaker-Jeita-Grotto-4_634403009433363875_img900x550_img900x550_crop.jpg
            // http://www.dailystar.com.lb/dailystar/Pictures/2011/07/04/13_634453800140116703_img900x550_img900x550_crop.jpg
            // http://www.dailystar.com.lb/dailystar/Pictures/2018/01/11/669500_img900x550_img900x550_crop.jpg
            //   http://www.dailystar.com.lb/dailystar/Pictures/2018/01/11/669500.jpg
            // http://www.dailystar.com.lb/dailystar/Pictures/2015/04/27/411756_img900x550_img900x550_crop.jpg
            //   http://www.dailystar.com.lb/dailystar/Pictures/2015/04/27/411756.jpg
            // http://www.dailystar.com.lb/dailystar/Pictures/2014/02/26/253362_img900x550_img900x550_crop.jpg
            //   http://www.dailystar.com.lb/dailystar/Pictures/2014/02/26/253362.jpg
            // http://www.dailystar.com.lb/dailystar/Pictures/2011/07/12/IMG_0080_634461096008782915_img900x550_img900x550_crop.JPG
            //   http://www.dailystar.com.lb/dailystar/Pictures/2011/07/12/IMG_0080_634461096008782915.JPG
            return src.replace(/([0-9]+)(?:_[^0-9][^/.]*)*(\.[^/.]*)$/, "$1$2");
        }

        if (domain === "images.dailykos.com") {
            // https://images.dailykos.com/images/359004/story_image/2016_Comparison_of_Presidential_and_House_Election_Margins_-_Republican_Incumbents.png?1485791213
            //   https://images.dailykos.com/images/359004/original/2016_Comparison_of_Presidential_and_House_Election_Margins_-_Republican_Incumbents.png?1485791213
            // https://images.dailykos.com/images/402092/small/GettyImages-135785191.jpg?1495062293
            //   https://images.dailykos.com/images/402092/original/GettyImages-135785191.jpg?1495062293
            // https://images.dailykos.com/images/489359/small/GpfQTnJ_1_.gif?1514432636
            //   https://images.dailykos.com/images/489359/original/GpfQTnJ_1_.gif?1514432636
            // https://images.dailykos.com/avatars/363/small/image.jpg?1454078865
            //   https://images.dailykos.com/avatars/363/original/image.jpg?1454078865
            return src.replace(/(\/(?:images|avatars)\/[0-9]+\/)[^/]*\/([^/]*)$/, "$1original/$2");
        }

        // chevereto
        if (domain === "imgmax.com") {
            // http://imgmax.com/images/2017/03/20/0OQhE.th.jpg
            //   http://imgmax.com/images/2017/03/20/0OQhE.jpg
            return src.replace(/\.th(\.[^/.]*)$/, "$1");
        }

        if (domain === "static.maxmodels.pl") {
            // https://static.maxmodels.pl/photos/1/c/b8/1cb801e95b178afa97bd106362bdec15_320123_thumb.jpg
            //   https://static.maxmodels.pl/photos/1/c/b8/1cb801e95b178afa97bd106362bdec15_320123.jpg
            // https://static.maxmodels.pl/article/e/f/e/efe5e8884994e41861fa95c6b48f4723_thumb.jpg
            //   https://static.maxmodels.pl/article/e/f/e/efe5e8884994e41861fa95c6b48f4723.jpg
            if (src.indexOf("/photos/") >= 0 || src.indexOf("/article/") >= 0) {
                return src.replace(/_thumb(\.[^/.]*)$/, "$1");
            }

            if (src.indexOf("/profile/") >= 0) {
                // https://static.maxmodels.pl/profile/6/c/9/6c9fd60f434f2a06212844dc6c073bf0_428915_428915_tinythumb.jpg
                //   https://static.maxmodels.pl/profile/6/c/9/6c9fd60f434f2a06212844dc6c073bf0_428915_428915_profile.jpg
                return src.replace(/_[a-z]+(\.[^/.]*)$/, "_profile$1");
            }
        }

        if (domain.indexOf(".img.yt") >= 0) {
            // https://x001.img.yt/small/2015/04/19/5532fb62ba401.jpg
            //   https://x001.img.yt/big/2015/04/19/5532fb62ba401.jpg
            return src.replace("/small/", "/big/");
        }

        if (domain === "wallpoper.com") {
            // http://wallpoper.com/images/00/26/57/27/taylor-momsen_00265727_thumb.jpg
            //   http://wallpoper.com/images/00/26/57/27/taylor-momsen_00265727.jpg
            return src.replace(/_thumb(\.[^/.]*)$/, "$1");
        }

        if (domain === "cdn.wallpaperjam.com") {
            // http://cdn.wallpaperjam.com/static/images/m/2b/35/2b359c913f740935e350c0b42c8c5b9da9804763.jpg
            //   https://cdn.wallpaperjam.com/2b359c913f740935e350c0b42c8c5b9da9804763/image.jpg
            return src.replace(/\/static\/images\/.*?\/([a-f0-9]+)(\.[^/.]*)$/, "/$1/image$2");
        }

        if (domain === "media.tabloidbintang.com") {
            // https://media.tabloidbintang.com/files/thumb/yoona-snsd_dira_2.jpg/1500
            //   https://media.tabloidbintang.com/files/yoona-snsd_dira_2.jpg
            // https://media.tabloidbintang.com/files/thumb/8bb22765c251c7b2741c1f69d06f2f93.jpg/222/140/fit
            return src.replace(/\/thumb\/([^/]*\.[^/.]*)(?:\/.*)/, "/$1");
        }

        if (domain === "media.teen.co.id") {
            // https://media.teen.co.id/files/thumb/tay6.jpg?p=trias93/&w=300&h=220&m=fit
            // https://media.teen.co.id/files/thumb/bianca_hello_4.jpg?p=trias93/&w=1024&m=fit
            //   https://media.teen.co.id/files/view/bianca_hello_4.jpg?p=trias93/
            return src.replace(/\/thumb\/([^/?]*\.[^/.?]*).*?[?&](p=[^&]*).*/, "/view/$1?$2");
        }

        if (domain.indexOf(".att.hudong.com") >= 0) {
            // http://a0.att.hudong.com/62/10/20200000013920144739106585140_s.jpg
            //   http://a0.att.hudong.com/62/10/20200000013920144739106585140.jpg
            // http://a4.att.hudong.com/41/08/300022729906133502080921900_s.jpg
            //   http://a4.att.hudong.com/41/08/300022729906133502080921900.jpg
            return src.replace(/_s(\.[^/.]*)$/, "$1");
        }

        if (domain === "www.ihanyu.com") {
            // http://www.ihanyu.com/cache/yiren/photo/0/2/130/2871.jpg
            //   http://www.ihanyu.com/uploadfile/yiren/photo/0/2/2871.jpg
            return src.replace(/\/cache\/([^/]*)\/([^/]*\/[0-9]+\/[0-9]+\/)[0-9]+\/([0-9]+\.[^/.]*)$/, "/uploadfile/$1/$2$3");
        }

        if (domain === "imgsh.jpnxcn.com") {
            // http://imgsh.jpnxcn.com/pics/star/pic/thumb_180_0_5de4fc683a33a8e1731ecc044918e3b3.jpg
            //   http://imgsh.jpnxcn.com/pics/star/pic/5de4fc683a33a8e1731ecc044918e3b3.jpg
            return src.replace(/\/thumb_[0-9]+_[0-9]+_/, "/");
        }

        if (domain === "www.gaobei.com" &&
            src.indexOf("/upload/") >= 0) {
            // s resizes up, b seems to be original
            // http://www.gaobei.com/upload/10001/article/2018_03/12175401_ace4sg_s.jpg
            //   http://www.gaobei.com/upload/10001/article/2018_03/12175401_ace4sg_b.jpg
            // http://www.gaobei.com/upload/10001/article/2015_12/28013712_kmxwsc_b.jpg - 2000x3000
            // http://www.gaobei.com/upload/10001/article/2016_05/10175130_1f7z15_b.jpg
            //   http://www.gaobei.com/upload/10001/article/2016_05/10175130_1f7z15.jpg -- doesn't work
            // http://www.gaobei.com/upload/10001/article/2017_10/20220510_cesgua.jpg
            //   http://www.gaobei.com/upload/10001/article/2017_10/20220510_cesgua_b.jpg -- doesn't work
            return src.replace(/_[a-z](\.[^/.]*)$/, "_b$1");
        }

        if (domain.match(/p[0-9]*\.pstatp\.com/)) {
            // http://p3.pstatp.com/medium/30f1001008f9067618b8
            //   http://p3.pstatp.com/large/30f1001008f9067618b8
            //   http://p3.pstatp.com/origin/30f1001008f9067618b8
            return src.replace(/(:\/\/[^/]*\/)[a-z]*\//, "$1origin/");
        }

        if (domain === "img.jizy.cn") {
            // l, m, s
            // https://img.jizy.cn/img/m/276318
            //   https://img.jizy.cn/img/l/276318
            return src.replace(/\/img\/[a-z]\//, "/img/l/");
        }

        if (domain === "v.img.pplive.cn") {
            // http://v.img.pplive.cn/sp240/ac/70/ac70a84165ea6782446f267948a0cd4e/3.jpg.webp
            //   http://v.img.pplive.cn/sp240/ac/70/ac70a84165ea6782446f267948a0cd4e/3.jpg.webp
            return src.replace(/(:\/\/[^/]*\/)sp[0-9]+\//, "$1");
        }

        if (domain === "uploadfile.bizhizu.cn") {
            // http://uploadfile.bizhizu.cn/2015/0821/20150821111539262.jpg
            //   http://uploadfile.bizhizu.cn/2015/0821/20150821111539262.jpg.source.jpg
            // http://uploadfile.bizhizu.cn/2017/1014/f9ddc2a68f0f516dcdbdbc0a32a7d187.jpg
            return src.replace(/(\/[0-9a-f]*\.)([^/.]*)$/, "$1$2.source.$2");
        }

        if (domain.match(/\.tgbusdata\.cn$/)) {
            // http://tv05.tgbusdata.cn/v3/thumb/jpg/YzhlMyw2MDAsNjAwLDQsMywxLC0xLDE=/u/shouji.tgbus.com/uploads/allimg/1508/17/3200-150QG32232.jpg
            //   http://shouji.tgbus.com/uploads/allimg/1508/17/3200-150QG32232.jpg
            // http://img2.tgbusdata.cn/v2/thumb/jpg/YzQ0NSw4MzAsNjQwLDQsMywxLC0xLDAscms1MA==/u/olpic.tgbusdata.cn/uploads/allimg/160324/238-160324160031.jpg
            //   http://olpic.tgbusdata.cn/uploads/allimg/160324/238-160324160031.jpg
            // http://img2.tgbusdata.cn/v2/thumb/jpg/MmIwZCw3MzAsNzMwLDQsMSwxLC0xLDAscms1MA==/u/olpic.tgbusdata.cn/uploads/allimg/121107/62-12110G34539.jpg
            //   http://olpic.tgbusdata.cn/uploads/allimg/121107/62-12110G34539.jpg
            // http://olpic.tgbusdata.cn/uploads/allimg/130415/62-1304151Q4110-L.jpg
            // http://ol04.tgbusdata.cn/v2/thumb/jpg/NmIxMSwwLDAsNCwzLDEsLTEsMCxyazUw/u/olpic.tgbusdata.cn/uploads/allimg/150408/144-15040QI505.jpg
            //   http://olpic.tgbusdata.cn/uploads/allimg/150408/144-15040QI505.jpg
            // http://img2.tgbusdata.cn/v2/thumb/jpg/NWM0NywwLDAsNCwzLDEsLTEsMCxyazUw/u/olpic.tgbusdata.cn/uploads/allimg/160321/274-160321115611.jpg
            //   http://olpic.tgbusdata.cn/uploads/allimg/160321/274-160321115611.jpg
            return src.replace(/.*\/thumb\/[^/]*\/[^/]*\/u\//, "http://");
        }

        if (domain === "img-toutiao.mia.com") {
            // https://img-toutiao.mia.com/d78e5392e7c518f7870c4ef9941b9809_img@base@tag=imgScale&q=60
            return src.replace(/\&.*/, ""); // removing @ works, but forces download, and very big images have imgScale so it's probably fine
        }

        if (domain.indexOf("pic.xeeok.com") >= 0) {
            // http://spic.xeeok.com/uploads/20171228/201712281413013469/297453_001_s.jpg
            //   http://spic.xeeok.com/uploads/20171228/201712281413013469/297453_001.jpg
            // http://pic.xeeok.com/uploads/20170406/201704060839007259/257437_001.jpg
            // http://pic.xeeok.com/uploads/20171208/201712080649411660/11988_007_s1024.jpg
            //   http://pic.xeeok.com/uploads/20171208/201712080649411660/11988_007.jpg
            //
            // http://pic.xeeok.com/uploads/20170902/201709021724546130/9683_010.jpg -- 001 = first image in album, not size
            return src.replace(/_s[0-9]*(\.[^/.]*)$/, "$1");
        }

        if (domain === "img.laonanren.com") {
            // https://img.laonanren.com/upload2/2015-02/15020914251864t.jpg
            //   https://img.laonanren.com/upload2/2015-02/15020914251864.jpg
            return src.replace(/t(\.[^/.]*)$/, "$1");
        }

        if (domain.indexOf(".share.photo.xuite.net") >= 0) {
            // https://4.share.photo.xuite.net/sm06059201/1469f4f/2721202/257867165_c.jpg
            // https://e.share.photo.xuite.net/esther1793/1e6a1d9/19835410/1124368327_x.jpg
            // https://7.share.photo.xuite.net/anber314/17e2d43/16287589/875503326_z.jpg (z > y, but y = 1.9mb, z = 900kb. larger, but a bit of quality is lost)
            // x and X are the same etc., o doesn't work
            // z, y, x, l, m, s, c, q, t (c is larger than x for gifs)
            return src.replace(/_[a-zA-Z](\.[^/.]*)$/, "_y$1");
        }

        if (domain === "img.sportsv.net") {
            // https://img.sportsv.net/img/ablheadline/cover/6/56/fit-fcc38HPLxU-1045x340.jpg
            //   https://img.sportsv.net/img/ablheadline/cover/6/56/fcc38HPLxU.jpg
            // https://img.sportsv.net/img/photo/image/5/78295/aspect-f3qjUcGTB2-1000xauto.jpg
            //   https://img.sportsv.net/img/photo/image/5/78295/f3qjUcGTB2.jpg
            // https://img.sportsv.net/img/photo/image/1/161211/tPkQGdrO3s.jpg
            return src.replace(/\/[a-z]+-([^-/]*)-[0-9a-z]*x[0-9a-z]*(\.[^/.]*)$/, "/$1$2");
        }

        if (domain.indexOf(".espncdn.com") >= 0) {
            // http://a3.espncdn.com/combiner/i?img=%2Fphoto%2F2017%2F0115%2Fr171425.jpg
            //   http://a3.espncdn.com/photo/2017/0115/r171425.jpg
            // http://a.espncdn.com/photo/2014/0615/nba_a_gindunc_288x162.jpg
            // http://a3.espncdn.com/photo/2016/0114/r44141_1296x729_16-9.jpg
            //   http://a3.espncdn.com/photo/2016/0114/r44141.jpg
            // http://a3.espncdn.com/combiner/i?img=%2Fphoto%2F2015%2F0429%2Fnba_g_crittenton1x_1296x729.jpg
            // http://a3.espncdn.com/photo/2015/0429/nba_g_crittenton1x_1296x729.jpg
            // http://a3.espncdn.com/photo/2013/0209/nba_jordan_36.jpg
            // http://a.espncdn.com/photo/2012/0930/rn_georgiatennessee_ms_21.jpg
            // http://a.espncdn.com/photo/2013/0922/nfl_u_darnelldockett_cmg_600.jpg
            newsrc = decodeURIComponent(src.replace(/\/combiner\/i\?img=([^&]*)/, "$1"));
            if (newsrc !== src)
                return newsrc;

            newsrc = src.replace(/(\/r[0-9]+)(?:_[^/.]*)(\.[^/.]*)$/, "$1$2");
            if (newsrc !== src)
                return newsrc;
        }











        if (src.match(/\/ImageGen\.ashx\?/)) {
            // http://www.lookalikes.info/umbraco/ImageGen.ashx?image=/media/97522/nick%20hewer%20-%20mark%20brown.jpeg&width=250&constrain=true
            //   http://www.lookalikes.info/media/97522/nick%20hewer%20-%20mark%20brown.jpeg
            return urljoin(src, src.replace(/.*\/ImageGen\.ashx.*?image=([^&]*).*/, "$1"));
        }

        // coppermine
        if (src.search(/\/(gallery|photos)\/albums\/[^/]*\/[^/]*\/(normal)|(thumb)_[^/._]*\.[^/.]*$/) >= 0 ||
           src.search(/\/(gallery|photos)\/albums\/[^/]*\/[^/]*\/[^/]*\/(normal)|(thumb)_[^/._]*\.[^/.]*$/) >= 0) {
            newsrc = src.replace(/(\/(gallery|photos)\/albums\/.*\/)[a-z]*_([^/._]*\.[^/.]*)$/, "$1$4");
            if (newsrc !== src)
                return newsrc;
        }

        // gnuboard
        // /data/editor/...
        // /data/file/...
        // /data/works/...
        if (src.match(/\/data\/[^/]*\/[^/]*\/[^/]*$/)) {
            return src.replace(/\/thumb-([^/]*)_[0-9]+x[0-9]+(\.[^/.]*)$/, "/$1$2");
        }

        // various korean news sites (heraldpop etc.)
        // test:
        // http://cgeimage.commutil.kr/phpwas/restmb_allidxmake.php?idx=1&simg=2017111113495301086f97ee432d6203243244.jpg
        // http://res.heraldm.com/phpwas/restmb_jhidxmake.php?idx=999&simg=201712220654304807972_20171222065329_01.jpg
        // http://cgeimage.commutil.kr/phpwas/restmb_setimgmake.php?w=90&h=60&m=1&simg=201712231138280443342246731f35814122117.jpg
        //   http://cgeimage.commutil.kr/phpwas/restmb_allidxmake.php?idx=999&simg=201712231138280443342246731f35814122117.jpg
        // http://res.heraldm.com/phpwas/restmb_jhidxmake.php?idx=5&simg=201507120010285799190_20150712001052_01.jpg
        // doesn't work:
        // http://cliimage.commutil.kr/phpwas/restmb_setimgmake.php?w=550&h=412&m=5&simg=2018030210280201075d307c1aeb0121131233211.jpg
        //   http://cliimage.commutil.kr/phpwas/restmb_setimgmake.php?idx=999&simg=2018030210280201075d307c1aeb0121131233211.jpg
        //   error: nIdx null
        //   http://cliimage.commutil.kr/phpwas/restmb_allidxmake.php?idx=999&simg=2018030210280201075d307c1aeb0121131233211.jpg - works
        if (src.search(/\/phpwas\/restmb_[a-z]*make\.php\?/) >= 0) {
            if (domain === "cgeimage.commutil.kr" ||
                domain === "cliimage.commutil.kr") {
                src = src.replace(/\/phpwas\/restmb_[a-z]*make\.php/, "/phpwas/restmb_allidxmake.php");
            }

            if (domain.indexOf("nimage.") === 0) {
                // http://nimage.newsway.kr/phpwas/restmb_idxmake.php?idx=200&simg=20180202000058_1024.jpg
                //   http://nimage.newsway.kr/photo/2018/02/02/20180202000058_1024.jpg
                // http://nimage.dailygame.co.kr/phpwas/restmb_idxmake.php?idx=3&simg=2015120515361257066_20151205153842_1.jpg
                //   http://nimage.dailygame.co.kr/photo/2015/12/05/2015120515361257066_20151205153842_1.jpg
                return src.replace(/\/phpwas\/restmb_idxmake\.php.*?simg=([0-9]{4})([0-9]{2})([0-9]{2})([^&]*).*?$/, "/photo/$1/$2/$3/$1$2$3$4");
            }

            if (domain === "res.heraldm.com" &&
                decodeURIComponent(src.match(/simg=([^&]*)/)[1])[0] === "/") {
                // http://res.heraldm.com/phpwas/restmb_idxmake.php?idx=999&simg=%2Fcontent%2Fimage%2F2015%2F07%2F13%2F20150713001359_0.jpg
                //   http://res.heraldm.com/content/image/2015/07/13/20150713001359_0.jpg
                // http://res.heraldm.com/phpwas/restmb_idxmake.php?idx=999&simg=/content/image/2018/02/02/20180202000714_0.jpg
                //   http://res.heraldm.com/content/image/2018/02/02/20180202000714_0.jpg
                return urljoin(src, decodeURIComponent(src.match(/simg=([^&]*)/)[1]));
            }

            //return src.replace(/\/phpwas\/restmb_[a-z]*make\.php\?.*(simg=[^&]*)/, "/phpwas/restmb_allidxmake.php?idx=999&$1");
            return src.replace(/(\/phpwas\/restmb_[a-z]*make\.php)\?.*(simg=[^&]*)/, "$1?idx=999&$2");
        }

        if (src.match(/\/wp-content\/.*?\/includes\/timthumb\.php/)) {
            // http://dublinfilms.fr/wp-content/themes/purity/includes/timthumb.php?src=http://dublinfilms.fr/wp-content/uploads/2014/06/Actu-bandeau-bis.jpg&h=260&w=662&zc=1
            //   http://dublinfilms.fr/wp-content/uploads/2014/06/Actu-bandeau-bis.jpg
            return src.replace(/.*\/wp-content\/.*?\/includes\/timthumb\.php\?.*?src=([^&]*).*/, "$1");
        }

        if (src.match(/\/fotogallery\/[0-9]+X[0-9]+\//)) {
            // http://static.pourfemme.it/pfcoppia/fotogallery/1200X0/11285/solene-rigot-e-zacharie-chasseriaud.jpg
            //   http://static.pourfemme.it/pfcoppia/fotogallery/99999999999X0/11285/solene-rigot-e-zacharie-chasseriaud.jpg
            // http://static.stylosophy.it/stshoes/fotogallery/1200X0/183603/decolletes-gioiello-gedebe-gialle.jpg
            //   http://static.stylosophy.it/stshoes/fotogallery/9999999999X0/183603/decolletes-gioiello-gedebe-gialle.jpg
            // http://static.qnm.it/www/fotogallery/1200X0/110767/martina-stella-bikini.jpg
            //   http://static.qnm.it/www/fotogallery/9999999999X0/110767/martina-stella-bikini.jpg
            // http://static.myluxury.it/myluxury/fotogallery/1200X0/119923/uovo-zen-by-nobu.jpg
            //   http://static.myluxury.it/myluxury/fotogallery/9999999999X0/119923/uovo-zen-by-nobu.jpg
            // http://static.derapate.it/derapate/fotogallery/1200X0/64729/grid-girls-motogp-le-ragazze-del-paddock-4.jpg
            //   http://static.derapate.it/derapate/fotogallery/9999999999X0/64729/grid-girls-motogp-le-ragazze-del-paddock-4.jpg
            return src.replace(/\/fotogallery\/[0-9]+X[0-9]+\//, "/fotogallery/9999999999X0/");
        }

        if (src.indexOf("/redim_recadre_photo.php") >= 0) {
            // probably the only site with this?
            // http://diffusionph.cccommunication.biz/jpgok/redim_recadre_photo.php?path_url=http://diffusionvid.cccommunication.biz/thumbnail_embed/46408.jpg&width=480&height=320
            //   http://diffusionvid.cccommunication.biz/thumbnail_embed/46408.jpg
            return src.replace(/.*\/redim_recadre_photo\.php\?.*?path_url=([^&]*).*/, "$1");
        }

        if (src.indexOf("/wp-apps/imrs.php?") >= 0) {
            // https://img.washingtonpost.com/wp-apps/imrs.php?src=https://img.washingtonpost.com/rw/2010-2019/Wires/Images/2017-10-15/AP/Britain_Hogwarts_Express_15930-4186c.jpg
            // https://img.washingtonpost.com/wp-apps/imrs.php?src=https://img.washingtonpost.com/news/comic-riffs/wp-content/uploads/sites/15/2017/11/PIXAR-COCO-frida-kahlo-cordova-buckley.jpg&w=480
            return src.replace(/.*\/wp-apps\/imrs\.php\?[^/]*src=([^&]*).*/, "$1");
        }

        if (src.match(/\/dynimage\/[^/]*\/[0-9]*\/[^/]*$/)) {
            // https://www.yield247.com/dynimage/imagesize10/1301/image.jpg
            // https://www.kyphimalta.com/dynimage/imagesize10/541/image.png
            // http://www.hitradingltd.com/dynimage/imagesize10/514/image.png
            return src.replace(/\/dynimage\/[^/]*\//, "/dynimage/original/"); // can be anything
        }

        if (src.match(/\/phocagallery\/.*\/thumbs\/[^/]*$/)) {
            // https://www.beautybybeccy.com.au/images/phocagallery/photoshoot/Promo%20Model%20shoot/thumbs/phoca_thumb_m_DSC09589-edit.jpg
            //   https://www.beautybybeccy.com.au/images/phocagallery/photoshoot/Promo%20Model%20shoot/DSC09589-edit.jpg
            return src.replace(/\/thumbs\/phoca_thumb_[^/._]*_/, "/");
        }

        if (src.match(/\/sfc\/servlet\.shepherd\/version\/renditionDownload/) && false) {
            // wip, need way to disable downloading?
            // sources:
            // https://salesforce.stackexchange.com/questions/171149/lightning-component-using-renditiondownload-to-view-files-img-doc-xlxs-etc
            // https://forum.bigcommerce.com/s/question/0D51B00003zftI0SAI/hide-the-bigcommerce-cdn-image-path-on-image-mouseover-product-detail-page
            // https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_files_rendition.htm
            // https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/connect_resources_files_preview_format.htm
            //
            // https://forum.bigcommerce.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=0681B0000064R3r&operationContext=CHATTER&contentId=05T1B00000GDv1i&page=0
            //   https://forum.bigcommerce.com/sfc/servlet.shepherd/version/renditionDownload?rendition=ORIGINAL_Png&versionId=0681B0000064R3r&operationContext=CHATTER&contentId=05T1B00000GDv1i
            //   https://forum.bigcommerce.com/sfc/servlet.shepherd/version/download/0681B0000064R3r (versionId, works, but requires download)
            // https://support.bigcommerce.com/servlet/rtaImage?eid=ka61B000000ClUi&feoid=00N1300000BR3CT&refid=0EM130000018Xoh
            //
            // doesn't work:
            // https://forum.bigcommerce.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=06813000005iizB&operationContext=CHATTER&contentId=05T1300000FCL6J
            //   https://forum.bigcommerce.com/sfc/servlet.shepherd/version/renditionDownload?rendition=ORIGINAL_Jpg&versionId=06813000005iizB&operationContext=CHATTER&contentId=05T1300000FCL6J -- works
            //return src.replace(/(\/renditionDownload.*?[?&]rendition=)[^&]*/, "$1ORIGINAL_Png");
        }

        if (domain.indexOf("cdn.vox-cdn.com") >= 0 ||
            domain === "thumbnails.trvl-media.com" ||
            src.match(/:\/\/[^/]*\/thumbor\/[^/]*=\//) ||
            src.match(/:\/\/[^/]*\/resizer\/[^/]*=\/[0-9]+x[0-9]+\/(?:filters:[^/]*\/)?/)) {
            // https://cdn.vox-cdn.com/thumbor/ta2xdyUViVrBXCLGapdwLY7is_s=/0x0:3000x2355/1200x800/filters:focal(1116x773:1596x1253)/cdn.vox-cdn.com/uploads/chorus_image/image/55856727/815434448.0.jpg
            // https://cdn.vox-cdn.com/thumbor/dXu99BQwBagCavae7oYNG0uBfxQ=/0x46:1100x779/1200x800/filters:focal(0x46:1100x779)/cdn.vox-cdn.com/assets/1763547/Screenshot_2012.11.12_10.39.10.jpg
            // https://cdn.vox-cdn.com/thumbor/iTJF1PhWPiR3-LoITuXxS2u8su0=/1200x0/filters:no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/4998263/keenan_2010.0.jpg
            // https://dotesports-cdn-prod-tqgiyve.stackpathdns.com/thumbor/baiRf8sOE9flXNjU5cHytZ9fqwA=/1200x0/filters:no_upscale()/https://dotesports-cdn-prod-tqgiyve.stackpathdns.com/article/ee3f5018-0e8b-4e5f-b040-c466c8979315.png
            //   https://dotesports-cdn-prod-tqgiyve.stackpathdns.com/article/ee3f5018-0e8b-4e5f-b040-c466c8979315.png
            // https://www.armytimes.com/resizer/M5qc8PYkbDFYKpOg0Bt-5rxWMXE=/1200x0/filters:quality(100)/arc-anglerfish-arc2-prod-mco.s3.amazonaws.com/public/QRMIMUNV7ZDDJFOLI5FJSYZKQI.jpg
            //   http://arc-anglerfish-arc2-prod-mco.s3.amazonaws.com/public/QRMIMUNV7ZDDJFOLI5FJSYZKQI.jpg
            // http://www.latimes.com/resizer/S-IaQvJtBOga26puDEgDkHihCqE=/1400x0/arc-anglerfish-arc2-prod-tronc.s3.amazonaws.com/public/TQAY2PZTVBAQVBCFEMZRY57HSE.jpg
            //   http://arc-anglerfish-arc2-prod-tronc.s3.amazonaws.com/public/TQAY2PZTVBAQVBCFEMZRY57HSE.jpg
            // https://thumbnails.trvl-media.com/8ngGMfPTsqKt4MGmUrf-ErVrGm4=/a.travel-assets.com/mediavault.le/media/9eed34ce4955bc445d38357fa3eb076400431778.jpeg
            //   http://a.travel-assets.com/mediavault.le/media/9eed34ce4955bc445d38357fa3eb076400431778.jpeg
            // https://thumbnails.trvl-media.com/cPqnei5uS1AEzRn7k5XzNoUjFuo=/534x356/images.trvl-media.com/hotels/1000000/30000/22100/22046/22046_358_y.jpg
            //return src.replace(/.*\/thumbor\/.*?\/([^/]*\..*)/, "http://$1");
            newsrc = src.replace(/.*\/(?:thumbor|resizer)\/.*?\/(?:filters:[^/]*\/)?([a-z]*:\/\/.*)/, "$1");
            if (newsrc !== src)
                return newsrc;

            newsrc = src.replace(/.*\/(?:thumbor|resizer)\/.*?\/(?:filters:[^/]*\/)?([^/]*\..*)/, "http://$1");
            if (newsrc !== src)
                return newsrc;

            return src.replace(/.*\/[-_A-Za-z0-9]+=\/(?:[0-9x:]+\/)?(?:filters:[^/]*\/)?([^/]*\..*)/, "http://$1");
        }

        if (src.match(/:\/\/[^/]*\/astronaut\/uploads\/[a-z]_[^/]*$/)) {
            // http://zoodydesign.com/astronaut/uploads/m_dt8a0843-1.jpg
            // http://astronaut-project.com/astronaut/uploads/s_scenes-1.jpg
            // http://coffeemegane.com/astronaut/uploads/s_buttertoast3.jpg
            // m, s, t
            return src.replace(/\/[a-z]_([^/]*)$/, "/$1");
        }

        if (src.match(/\/spree\/images\/attachments\/[0-9]+\/[0-9]+\/[0-9]+\//)) {
            // https://static-assets.glossier.com/production/spree/images/attachments/000/001/802/square_tiny/1.jpg?1518217843
            //   https://static-assets.glossier.com/production/spree/images/attachments/000/001/802/original/1.jpg?1518217843
            return src.replace(/(\/spree\/images\/attachments\/[0-9]+\/[0-9]+\/[0-9]+\/)[^/]*\/([^/?]*)[^/]*?$/, "$1original/$2");
        }

        if (src.match(/\/applications\/core\/interface\/imageproxy\/imageproxy\.php/)) {
            // https://www.gfsquad.com/forums/applications/core/interface/imageproxy/imageproxy.php?img=http%3A%2F%2Fpds.joins.com%2Fnews%2Fcomponent%2Filgan_isplus%2F201701%2F13%2F2017011315392489300.jpeg&key=6b519f95396e21199c45a761bfe54fadbb09cf562c31b39591a14f25386ea26c
            //   http://pds.joins.com/news/component/ilgan_isplus/201701/13/2017011315392489300.jpeg
            return decodeURIComponent(src.replace(/.*\/imageproxy\/imageproxy\.php.*?[&?]img=([^&]*).*?$/, "$1"));
        }

        if (src.match(/\/dims[0-9]*\/.*?\/thumbnail\/[0-9]+[xX][0-9]+[^/]*\/.*?(?:\/https?:\/\/|\?url=https?%3A)/)) {
            // https://www.usnews.com/dims4/USNEWS/b09d13c/2147483647/thumbnail/970x647/quality/85/?url=http%3A%2F%2Fmedia.beam.usnews.com%2Fd0%2F686a3b584a63500605362dd3a1da31%2Ftag%3Areuters.com%2C2018%3Anewsml_LYNXNPEE25072%3A12018-03-06T044537Z_1_LYNXNPEE25072_RTROPTP_3_THAILAND-POLITICS.JPG
            // https://www.usnews.com/dims4/USNEWS/f128de1/2147483647/thumbnail/640x420/quality/85/?url=http%3A%2F%2Fmedia.beam.usnews.com%2Fbd%2F0cf00f10ccd3788e7b9a42f1717e9d%2Ftag%3Areuters.com%2C2018%3Anewsml_LYNXNPEE1R088%3A12018-02-28T035131Z_1_LYNXNPEE1R088_RTROPTP_3_NORTHKOREA-SOUTHKOREA.JPG
            // https://assets.sourcemedia.com/dims4/default/80669dd/2147483647/thumbnail/1200x630%3E/quality/90/?url=https%3A%2F%2Fassets.sourcemedia.com%2Fd9%2Fdf%2Fdf39cfb641848cd34eb997e96dc1%2Ffp-hockey-thumbnail-3-7-18.jpg
            // http://cdn.expansion.mx/dims4/default/5227468/2147483647/thumbnail/850x478%5E/quality/75/?url=https%3A%2F%2Fcdn.expansion.mx%2Fmedia%2F2010%2F06%2F08%2Fobreros-chinos-trabajadores-china.jpg
            // https://static.politico.com/dims4/default/cf5f5c0/2147483647/thumbnail/1160x629%5E/quality/90/?url=https%3A%2F%2Fstatic.politico.com%2F0f%2F99%2F94afe4ce45b9ab5aae5bab68ba12%2F23-donald-trump-145-gty-1160.jpg
            // https://cdn.peopleewnetwork.com/dims4/default/120c6ea/2147483647/thumbnail/1200x630/quality/90/?url=http%3A%2F%2Fpmd369713tn.download.theplatform.com.edgesuite.net%2FTime_Inc._-_OTT_-_Production%2F938%2F485%2Foscars-red-carpet-live-2018-thumbnail.jpg
            // https://d1nwosmzpc2sru.cloudfront.net/dims4/GG/54de7b9/2147483647/thumbnail/1350x580/quality/90/?url=https%3A%2F%2Fd1nwosmzpc2sru.cloudfront.net%2F27%2Fa8%2Ff64376a04a1babb29fe2f46c651c%2Fdp-bcg54217-online-store-generic-dl.png
            // http://cdn2.uvnimg.com/dims4/default/2fc4182/2147483647/thumbnail/400x250%3E/quality/75/?url=http%3A%2F%2Fcdn4.uvnimg.com%2F18%2F9e%2F0bc507aa44d6a563d06d223a647c%2Funtitled-1.jpg
            // https://cdn.video.nationalgeographic.com/dims4/default/8efd9cf/2147483647/thumbnail/354x199%3E/quality/90/?url=http%3A%2F%2Fcdn.video.nationalgeographic.com%2F6b%2F61%2F546ff7344acaac17399cd281fcef%2Fnw-seo-srt-013-nobel-prize-thumbnail-final.jpg
            //   http://cdn.video.nationalgeographic.com/6b/61/546ff7344acaac17399cd281fcef/nw-seo-srt-013-nobel-prize-thumbnail-final.jpg
            //
            // https://d33ljpvc0tflz5.cloudfront.net/dims3/MMH/thumbnail/620x392/quality/75/?url=https%3A%2F%2Fd26ua9paks4zq.cloudfront.net%2F68%2F8d%2F197eef2a45cb84795efda4607102%2Fendoscopy-738x399-s1-stk-119373043.jpg
            //   https://d26ua9paks4zq.cloudfront.net/68/8d/197eef2a45cb84795efda4607102/endoscopy-738x399-s1-stk-119373043.jpg
            // http://o.aolcdn.com/dims-shared/dims3/MUSIC/thumbnail/280X390/quality/90/http://o.aolcdn.com/os/music/artist/wikipedia/the-platters-1970.jpg
            // http://o.aolcdn.com/dims-shared/dims3/MUSIC/thumbnail/280X390/http://o.aolcdn.com/os/music/artist/wikipedia/the-platters-1970.jpg
            //   http://o.aolcdn.com/os/music/artist/wikipedia/the-platters-1970.jpg
            newsrc = src.replace(/.*\/thumbnail\/.*?\/(https?:\/\/.*)/, "$1");
            if (newsrc !== src)
                return newsrc;
            return decodeURIComponent(src.replace(/.*\/thumbnail\/.*?\/\?url=(https?.*)/, "$1"));
        }

        // joomla
        if (src.match(/\/media\/k2\/items\/cache\/[^/]*_[^/]*\.[^/.]*$/)) {
            // http://www.truth-out.org/media/k2/items/cache/3393b2ec8c305f926fd19b07e9a77e2a_L.jpg
            //   http://www.truth-out.org/media/k2/items/src/3393b2ec8c305f926fd19b07e9a77e2a.jpg
            // http://www.frankie.com.au/media/k2/items/cache/d3a6ffb9fa95acd07ae12a9b3648acf3_M.jpg
            //   http://www.frankie.com.au/media/k2/items/src/d3a6ffb9fa95acd07ae12a9b3648acf3.jpg
            return src.replace(/\/cache\/([^/]*)_[^/._]*?(\.[^/.]*)$/, "/src/$1$2");
        }




        if (domain.indexOf("media.toofab.com") >= 0 && true) { // doesn't work for all urls
            // works:
            // https://media.toofab.com/2017/12/13/gettyimages-891360920-master-1000w.jpg
            // https://media.toofab.com/2017/12/13/gettyimages-891258416-master-1000w.jpg
            // doesn't work:
            // https://media.toofab.com/2017/10/31/screen-shot-2017-10-31-at-3-57-1000w.jpg (300x250 works)
            src = src.replace(/-[0-9]+w\.([^/.]*)/, ".$1");

            // works:
            // https://media.toofab.com/2018/01/02/stars-who-refuse-to-take-selfies-with-fans-split-480x360.jpg (1000w works too)
            // doesn't work: (access denied)
            // https://media.toofab.com/2018/01/02/0102-justin-timberlake-main-300x250.jpg
            // https://media.toofab.com/2018/01/02/0102-justin-timberlake-main-810x610.jpg
            // https://media.toofab.com/2017/10/23/gettyimages-844434368-810x610.jpg
            // https://media.toofab.com/2018/01/02/traveling-pants-everett-300x400.jpg
            // https://media.toofab.com/2017/11/01/timberlake-teaser-480x360.jpg
            // https://media.toofab.com/2017/12/22/1222-tom-katie-lala-main-300x250.jpg
            src = src.replace(/-[0-9]+x[0-9]+\.([^/.]*)/, ".$1");
        }

        return src;
    }

    var bigimage_recursive = function(url) {
        var newhref = url;
        for (var i = 0; i < 1000; i++) {
            var newhref1 = fullurl(newhref, bigimage(newhref));
            if (newhref1 !== newhref) {
                newhref = newhref1;
            } else {
                break;
            }

            if (_nir_debug_) {
                break;
            }
        }
        return newhref;
    };

    if (is_node) {
        module.exports = bigimage_recursive;
    } else {
        /*var newhref = document.location.href;
        while (true) {
            var newhref1 = fullurl(newhref, bigimage(newhref));
            if (newhref1 !== newhref) {
                newhref = newhref1;
            } else {
                break;
            }

            if (_nir_debug_) {
                break;
            }
            }*/
        var newhref = bigimage_recursive(document.location.href);

        if (newhref !== document.location.href) {
            if (!_nir_debug_) {
                console.log(newhref);

                // problem: access control origin header
                var http = new XMLHttpRequest();
                http.open('HEAD', force_https(newhref));
                http.onreadystatechange = function() {
                    if (this.readyState == this.DONE) {
                        var digit = this.status.toString()[0];

                        if ((digit === "4" || digit === "5" || digit === "0") &&
                            this.status !== 405) {
                            console.log("Error: " + this.status);
                            return;
                        }

                        // wrap in try/catch due to nano defender
                        try {
                            window.stop();
                        } catch (e) {
                        }
                        document.location = newhref;
                    }
                };
                http.send();
            }
        }
    }
})();
