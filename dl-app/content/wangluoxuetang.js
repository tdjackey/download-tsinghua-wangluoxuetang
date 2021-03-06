/*
 * 李天阳 2013
 * ty@li-tianyang.com
 */

Components.utils.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Downloads.jsm");
Components.utils.import("resource://gre/modules/Task.jsm");

Components.utils.import("resource://wlxt_modules/WLXTUtils.jsm");

if ("undefined" == typeof (WLXT)) {
    var WLXT = {};
};

WLXT.BrowserOverlay = {

    seekHelp : function(aEvent) {
        window.openDialog("chrome://wangluoxuetang/content/seekHelp.xul", "wlxt-seek-help", "chrome,centerscreen");
    },

    feedback : function(aEvent) {
        window.openDialog("chrome://wangluoxuetang/content/feedback.xul", "wlxt-feedback", "chrome,centerscreen");
    },

    startDownload : function(aEvent) {
        window.openDialog("chrome://wangluoxuetang/content/confirmStart.xul", "wlxt-confirm-start", "chrome,centerscreen");
    }
};

WLXT.DownloadData = {
    /*
     * TODO: use some better $strWindowFeatures?
     */
    strWindowFeatures : "",

    /*
     * stores each class's information
     */
    ClassDatum : function() {
        this.id = "";
        this.name = "";
    },

    escapeRegExp : function(string) {
        /*
         * taken from:
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
         */
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    },
};

WLXT.DownloadData.getClassNameURL = function(classRow) {
    var classDatum = new WLXT.DownloadData.ClassDatum();
    var classLink = classRow.getElementsByTagName("a")[0];
    /*
     * TODO: this might change over the years
     *
     * http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/course_locate.jsp?course_id=${id}
     */
    var getIDFromURLRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/lesson\/student\/course_locate\.jsp\?course_id\=(\d+)/;
    classDatum.id = getIDFromURLRegex.exec(classLink.href).pop();
    classDatum.name = classLink.innerHTML.trim();
    return classDatum;
};

WLXT.DownloadData.PageType = {
    /*
     * ordered according to @WLXT.DownloadData.downloadClass
     */
    NOTE_ID : 0,
    COURSE_INFO : 1,
    DOWNLOAD : 2,
    WARE_LIST : 3,
    HOM_WK_BRW : 4,
    HOM_WK_BRW_0 : 9,
    HOM_WK_BRW_1 : 10,
    BBS_ID_STUDENT : 5,
    TALKID_STUDENT : 6,
    TALKID_STUDENT_0 : 11,
    DISCUSS_MAIN : 7,

    /*
     * 课程公告
     */
    NOTE_REPLY : 8,

    /*
     * IMPORTANT: new const should start from 12
     */
};

WLXT.DownloadData.downloadClass = function(classDatum) {

    if (classDatum.id == "9281") {
        /*
         * do not process
         * UNIX大本营
         */
        WLXTUtils.courseListInd += 1;
        document.dispatchEvent(new Event("openCourse"));
        return;
    }

    switch (WLXTUtils.downloadClassPage) {

        case 0:
            WLXTUtils.dlHelper[classDatum.id] = new WLXTUtils.ClassHelper();
            WLXTUtils.dlHelper[classDatum.id].dir = WLXTUtils.dlDir.clone();
            WLXTUtils.dlHelper[classDatum.id].dir.append(classDatum.id);
            if (!WLXTUtils.dlHelper[classDatum.id].dir.exists()) {
                WLXTUtils.dlHelper[classDatum.id].dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0700", 8));
            }

            /*
             * TODO: this might change over the years
             *
             * 课程公告 open this
             * http://learn.tsinghua.edu.cn/MultiLanguage/public/bbs/getnoteid_student.jsp?course_id=${id}
             * to get this
             * http://learn.tsinghua.edu.cn/MultiLanguage/public/bbs/note_list_student.jsp?bbs_id=${bbs_id}&course_id=${course_id}
             * TODO: what's bbs id?
             */

            window.open("http://learn.tsinghua.edu.cn/MultiLanguage/public/bbs/getnoteid_student.jsp?course_id=" + classDatum.id);

            break;

        case 1:
            /*
             * 课程信息
             * http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/course_info.jsp?course_id=${id}
             */
            window.open("http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/course_info.jsp?course_id=" + classDatum.id);
            break;

        case 2:
            /*
             * 课程文件
             * http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/download.jsp?course_id=${id}
             */
            window.open("http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/download.jsp?course_id=" + classDatum.id);
            break;

        case 3:
            /*
             * 教学资源
             * http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/ware_list.jsp?course_id=${id}
             */
            window.open("http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/ware_list.jsp?course_id=" + classDatum.id);
            break;

        case 4:
            /*
             * 课程作业
             * http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/hom_wk_brw.jsp?course_id=${id}
             */
            window.open("http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/hom_wk_brw.jsp?course_id=" + classDatum.id);
            break;

        // case 5:
        /*
        * 课程答疑 open this
        * http://learn.tsinghua.edu.cn/MultiLanguage/public/bbs/getbbsid_student.jsp?course_id=${id}
        * to get this
        * http://learn.tsinghua.edu.cn/MultiLanguage/public/bbs/bbs_list_student.jsp?bbs_id=${id}&course_id=${id}
        */
        /*
        * nobody uses this we'll just skip over it
        */
        // break;
        case 5:
            /*
             * 课程讨论 open this
             * http://learn.tsinghua.edu.cn/MultiLanguage/public/bbs/gettalkid_student.jsp?course_id=${id}
             * to get this
             * http://learn.tsinghua.edu.cn/MultiLanguage/public/bbs/talk_list_student.jsp?bbs_id=${id}&course_id=${id}
             */
            window.open("http://learn.tsinghua.edu.cn/MultiLanguage/public/bbs/gettalkid_student.jsp?course_id=" + classDatum.id);
            break;

        // case 7:
        /*
        * 自由讨论区
        * http://learn.tsinghua.edu.cn/MultiLanguage/public/discuss/main.jsp?course_id=${id}
        */
        /*
        * nobody uses this we'll just skip over it
        */
        // break;
        default:
            break;
    }

    WLXTUtils.downloadClassPage += 1;

    if (WLXTUtils.downloadClassPage == 6) {
        WLXTUtils.downloadClassPage = 0;
        WLXTUtils.courseListInd += 1;
    }

};

WLXT.DownloadData.checkCoursePageType = function(URL) {
    /*
     * check to see which page was opened as listed in
     * @WLXT.DownloadData.downloadClass
     */

    /*
     * TODO: speed this up?
     */

    var pageType = {
        type : -1,
        id : "",
    };
    var regexExec;

    var noteIDRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/public\/bbs\/note_list_student\.jsp\?bbs_id\=\d+&course_id\=(\d+)/;
    if (( regexExec = noteIDRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.NOTE_ID;
        pageType.id = regexExec.pop();
        return pageType;
    }

    /* http://learn.tsinghua.edu.cn/MultiLanguage/public/bbs/note_reply.jsp?bbs_type=课程公告&id={POST_ID?}&course_id={COURSE_ID?} */
    var noteReplyRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/public\/bbs\/note_reply\.jsp\?bbs_type\=\S+&id\=(\d+)&course_id\=(\d+)/;
    if (( regexExec = noteReplyRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.NOTE_REPLY;
        pageType["courseID"] = regexExec.pop();
        pageType.id = regexExec.pop();
        return pageType;
    }

    var courseInfoRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/lesson\/student\/course_info\.jsp\?course_id\=(\d+)/;
    if (( regexExec = courseInfoRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.COURSE_INFO;
        pageType.id = regexExec.pop();
        return pageType;
    }

    var downloadRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/lesson\/student\/download\.jsp\?course_id\=(\d+)/;
    if (( regexExec = downloadRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.DOWNLOAD;
        pageType.id = regexExec.pop();
        return pageType;
    }

    var wareListRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/lesson\/student\/ware_list\.jsp\?course_id\=(\d+)/;
    if (( regexExec = wareListRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.WARE_LIST;
        pageType.id = regexExec.pop();
        return pageType;
    }

    var homWkBrwRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/lesson\/student\/hom_wk_brw\.jsp\?course_id\=(\d+)/;
    if (( regexExec = homWkBrwRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.HOM_WK_BRW;
        pageType.id = regexExec.pop();
        return pageType;
    }

    var hwDlPage0Regex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/lesson\/student\/hom_wk_detail\.jsp\?id\=(\d+)&course_id\=(\d+)&rec_id\=.*/;
    if (( regexExec = hwDlPage0Regex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.HOM_WK_BRW_0;
        pageType.id = regexExec[2];
        pageType["hwId"] = regexExec[1];
        return pageType;
    }

    var hwDlPage1Regex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/lesson\/student\/hom_wk_view\.jsp\?id\=(\d+)&course_id\=(\d+)/;
    if (( regexExec = hwDlPage1Regex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.HOM_WK_BRW_1;
        pageType.id = regexExec[2];
        pageType["hwId"] = regexExec[1];
        return pageType;
    }

    var bbsIDStudentRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/public\/bbs\/bbs_list_student\.jsp\?bbs_id\=\d+&course_id\=(\d+)/;
    if (( regexExec = bbsIDStudentRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.BBS_ID_STUDENT;
        pageType.id = regexExec.pop();
        return pageType;
    }

    var talkIDStudentRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/public\/bbs\/talk_list_student\.jsp\?bbs_id\=\d+&course_id\=(\d+)/;
    if (( regexExec = talkIDStudentRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.TALKID_STUDENT;
        pageType.id = regexExec.pop();
        return pageType;
    }

    var talkIDStudentPostRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/public\/bbs\/talk_reply_student\.jsp\?bbs_id\=\d+&course_id\=(\d+)&id\=(\d+)&rep_num\=\d+&up_url\=talk_list_student\.jsp&default_cate_id\=\d+/;
    if (( regexExec = talkIDStudentPostRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.TALKID_STUDENT_0;
        pageType.id = regexExec[1];
        pageType["discId"] = regexExec[2];
        return pageType;
    }

    var discussMainRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/public\/discuss\/main\.jsp\?course_id\=(\d+)/;
    if (( regexExec = discussMainRegex.exec(URL)) !== null) {
        pageType.type = WLXT.DownloadData.PageType.DISCUSS_MAIN;
        pageType.id = regexExec.pop();
        return pageType;
    }

    return pageType;
};

WLXT.DownloadData.REFRESH_SESSION_COOKIE_TIME = 1 * 60 * 1000;

WLXT.DownloadData.refreshSessionCookie = function() {
    window.open("http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/MyCourse.jsp?typepage=3");
};

WLXT.DownloadData.onPageLoad = function(aEvent) {

    /*
     * TODO: change how page is detected?
     */
    switch (aEvent.target.URL) {

        // only for exact matches
        case "http://learn.tsinghua.edu.cn/":
        case "https://learn.tsinghua.edu.cn/index.jsp":
        case "https://learn.tsinghua.edu.cn/":

            WLXTUtils.dlDir = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("DfltDwnld", Components.interfaces.nsIFile);
            WLXTUtils.dlDir.append("wlxt");
            if (!WLXTUtils.dlDir.exists()) {
                WLXTUtils.dlDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0700", 8));
            } else {
                WLXTUtils.dlDir.remove(true);
                WLXTUtils.dlDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0700", 8));
            }

            var dlNotice = aEvent.target.getElementsByClassName("td1")[0];
            dlNotice.innerHTML = "<div>这个工具运行的时间会比较长而且在运行过程中无法使用 Firefox, 不使用 Firefox 的时候才能下载.</div>";
            dlNotice.innerHTML += "<hr><div>下载期间可能图像上不会有任何变化, 并且窗口会频繁打开和关闭, 但是只要不死机该工具都在正常运行, 不必担心.</div>";
            dlNotice.innerHTML += "<hr><div><strong>如果下载中发现下载进度长时间未改变, 可以打开<a href=\"http://learn.tsinghua.edu.cn\">learn.tsinghua.edu.cn</a>重新开始下载</strong></div>";
            dlNotice.innerHTML += "<hr><div>另外该工具的安装会影响 Firefox 正常使用, 若不使用该工具关闭该窗口后 Shift+Ctrl+A disable 或者卸载.</div>";
            dlNotice.innerHTML += "<hr><div>重要: Firebug (如果安装过) 在运行该工具的过程中要 disable 或者删除, 关闭该窗口后 Shift+Ctrl+A 进行操作.</div>";
            dlNotice.innerHTML += "<hr><div>若有任何疑问, 可以发邮件联系李天阳 (<a href=\"mailto:ty@li-tianyang.com\">ty@li-tianyang.com</a>).</div>";

            var loginTableBody = aEvent.target.getElementsByTagName('body')[0]
            .getElementsByTagName('table')[4].getElementsByTagName('tbody')[0];
            var notifyUserCell = loginTableBody.insertRow(0).insertCell(0);
            notifyUserCell.innerHTML = '<strong style="color: red">下载网络学堂从这里登录</strong>';
            break;

        case "http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/mainstudent.jsp":
            aEvent.target.defaultView.setInterval(function() {
                WLXT.DownloadData.refreshSessionCookie();
            }, WLXT.DownloadData.REFRESH_SESSION_COOKIE_TIME);

            var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
            domWindowUtils.garbageCollect();

            var userInfoDiv = aEvent.target.createElement("div");
            userInfoDiv.innerHTML = "<div>这个工具运行的时间会比较长而且在运行过程中无法使用 Firefox, 不使用 Firefox 的时候才能下载.</div>";
            userInfoDiv.innerHTML += "<hr><div>下载期间可能图像上不会有任何变化, 并且窗口会频繁打开和关闭, 但是只要不死机该工具都在正常运行, 不必担心.</div>";
            userInfoDiv.innerHTML += "<hr><div><strong>如果下载中发现下载进度长时间未改变, 可以打开<a href=\"http://learn.tsinghua.edu.cn\">learn.tsinghua.edu.cn</a>重新开始下载</strong></div>";
            userInfoDiv.innerHTML += "<hr><div>另外该工具的安装会影响 Firefox 正常使用, 若不使用该工具关闭该窗口后 Shift+Ctrl+A disable 或者卸载.</div>";
            userInfoDiv.innerHTML += "<hr><div>重要: Firebug (如果安装过) 在运行该工具的过程中要 disable 或者删除, 关闭该窗口后 Shift+Ctrl+A 进行操作.</div>";
            userInfoDiv.innerHTML += "<hr><div>若有任何疑问, 可以发邮件联系李天阳 (<a href=\"mailto:ty@li-tianyang.com\">ty@li-tianyang.com</a>).</div>";

            var box = aEvent.target.getElementById("box");
            var parNode = box.parentNode;
            parNode.insertBefore(userInfoDiv, box);

            window.open("http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/MyCourse.jsp?typepage=2", "wlxt_list_window", WLXT.DownloadData.strWindowFeatures);
            break;

        case "http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/MyCourse.jsp?typepage=3":
            aEvent.target.defaultView.setTimeout(function() {
                window.close();
                var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                domWindowUtils.garbageCollect();
            }, 5 * 1000);
            break;

        case "http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/MyCourse.jsp?typepage=2":
            /*
             * get course listing
             */
            var classRows = aEvent.target.getElementById("info_1").rows;
            var classData = {};

            var classDirFile = WLXTUtils.dlDir.clone();
            classDirFile.append("course_id.csv");
            if (!classDirFile.exists()) {
                classDirFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
            }

            var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
            foStream.init(classDirFile, -1, parseInt("0600", 8), 0);
            var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
            converter.init(foStream, "UTF-8", 0, 0);

            WLXTUtils.courseList = new Array(classRows.length - 2);

            for (var i = 0; i < classRows.length - 2; ++i) {
                var classDatum = WLXT.DownloadData.getClassNameURL(classRows[i + 2]);
                classData[classDatum.id] = classDatum;
                converter.writeString("\"" + classDatum.id + "\",\"" + classDatum.name + "\"" + "\n");
                WLXTUtils.courseList[i] = classDatum;
            }

            converter.close();
            WLXTUtils.courseListInd = 0;
            document.dispatchEvent(new Event("openCourse"));
            aEvent.target.defaultView.close();
            var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
            domWindowUtils.garbageCollect();
            break;

        default:

            var pageType = WLXT.DownloadData.checkCoursePageType(aEvent.target.URL);
            switch (pageType.type) {

                // for regex matches
                case WLXT.DownloadData.PageType.NOTE_ID:
                    WLXTUtils.dlHelper[pageType.id].kcggDir = WLXTUtils.dlHelper[pageType.id].dir.clone();
                    WLXTUtils.dlHelper[pageType.id].kcggDir.append("kcgg");
                    if (!WLXTUtils.dlHelper[pageType.id].kcggDir.exists()) {
                        WLXTUtils.dlHelper[pageType.id].kcggDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0700", 8));
                    }

                    var kcggCSV = WLXTUtils.dlHelper[pageType.id].kcggDir.clone();
                    kcggCSV.append("kcgg.csv");
                    if (!kcggCSV.exists()) {
                        kcggCSV.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                    }

                    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    foStream.init(kcggCSV, -1, parseInt("0600", 8), 0);
                    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                    converter.init(foStream, "UTF-8", 0, 0);

                    var notesRows = aEvent.target.getElementById("table_box").rows;
                    WLXTUtils.kcggListInd = 0;
                    if (notesRows.length == 0) {
                        WLXTUtils.kcggList = new Array(0);
                    } else {
                        WLXTUtils.kcggList = new Array(notesRows.length - 1);
                        for (var i = 1; i != notesRows.length; i++) {
                            var noteMetaInfo = {
                                serial : notesRows[i].cells[0].innerHTML.trim(),
                                title : notesRows[i].cells[1].getElementsByTagName("a")[0].innerHTML.trim(),
                                publisher : notesRows[i].cells[2].innerHTML.trim(),
                                date : notesRows[i].cells[3].innerHTML.trim(),
                                URL : notesRows[i].cells[1].getElementsByTagName("a")[0].href.trim(),
                            };
                            var noteReplyRegex = /http\:\/\/learn\.tsinghua\.edu\.cn\/MultiLanguage\/public\/bbs\/note_reply\.jsp\?bbs_type\=\S+&id\=(\d+)&course_id\=\d+/;
                            var noteID = noteReplyRegex.exec(noteMetaInfo.URL).pop();
                            converter.writeString("\"" + noteID + "\",\"" + noteMetaInfo.serial + "\",\"" + noteMetaInfo.title + "\",\"" + noteMetaInfo.publisher + "\",\"" + noteMetaInfo.date + "\"");
                            WLXTUtils.kcggList[i - 1] = noteMetaInfo;
                        }

                        converter.close();
                    }
                    document.dispatchEvent(new Event("kcggDl"));
                    aEvent.target.defaultView.close();
                    var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                    domWindowUtils.garbageCollect();
                    break;

                case WLXT.DownloadData.PageType.NOTE_REPLY:
                    var noteTable = aEvent.target.getElementById("table_box");

                    var noteFile = WLXTUtils.dlHelper[pageType.courseID].kcggDir.clone();
                    noteFile.append(pageType.id + ".html");
                    if (!noteFile.exists()) {
                        noteFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                    }

                    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    foStream.init(noteFile, -1, parseInt("0600", 8), 0);
                    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                    converter.init(foStream, "UTF-8", 0, 0);

                    converter.writeString(noteTable.innerHTML);

                    converter.close();

                    document.dispatchEvent(new Event("kcggDl"));
                    aEvent.target.defaultView.close();
                    var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                    domWindowUtils.garbageCollect();
                    break;

                case WLXT.DownloadData.PageType.COURSE_INFO:
                    var infoFile = WLXTUtils.dlHelper[pageType.id].dir.clone();
                    infoFile.append(pageType.id + ".html");
                    if (!infoFile.exists()) {
                        infoFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                    }

                    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    foStream.init(infoFile, -1, parseInt("0600", 8), 0);
                    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                    converter.init(foStream, "UTF-8", 0, 0);
                    converter.writeString(aEvent.target.body.innerHTML);
                    converter.close();
                    // TODO: follow links in here?
                    document.dispatchEvent(new Event("openCourse"));
                    aEvent.target.defaultView.close();
                    var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                    domWindowUtils.garbageCollect();
                    break;

                case WLXT.DownloadData.PageType.DOWNLOAD:
                    /*
                     * tables called Layer1 Layer2 etc.
                     */

                    WLXTUtils.dlHelper[pageType.id].kcwjDir = WLXTUtils.dlHelper[pageType.id].dir.clone();
                    WLXTUtils.dlHelper[pageType.id].kcwjDir.append("kcwj");
                    if (!WLXTUtils.dlHelper[pageType.id].kcwjDir.exists()) {
                        WLXTUtils.dlHelper[pageType.id].kcwjDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0700", 8));
                    }

                    var dlInfoFile = WLXTUtils.dlHelper[pageType.id].kcwjDir.clone();
                    dlInfoFile.append("kcwj.csv");
                    if (!dlInfoFile.exists()) {
                        dlInfoFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                    }

                    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    foStream.init(dlInfoFile, -1, parseInt("0600", 8), 0);
                    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                    converter.init(foStream, "UTF-8", 0, 0);

                    WLXTUtils.kcwjList = new Array();
                    WLXTUtils.kcwjListInd = 0;

                    var curLayer = 1;
                    var dlTable = aEvent.target.getElementById("Layer" + curLayer.toString());
                    while (dlTable !== null) {
                        var layerName = aEvent.target.getElementById("ImageTab" + curLayer.toString()).innerHTML.trim();
                        var layerTrs = dlTable.getElementsByTagName("tr");
                        if (layerTrs.length > 1) {
                            for (var i = 1; i != layerTrs.length; i++) {
                                // TODO: is this regex good enough?
                                var fileNameRegex = /<!--.*getfilelink\=(.*)&id\=.*-->/;
                                var fileName = fileNameRegex.exec(layerTrs[i].innerHTML
                                .trim())[1];
                                var fileLink = layerTrs[i].cells[1]
                                .getElementsByTagName("a")[0];
                                var fileIdRegex = /file_id\=(\d+)/;
                                var fileId = fileIdRegex.exec(fileLink.href)[1];
                                converter.writeString("\"" + layerTrs[i].cells[0].innerHTML.trim() + "\",\"" + fileLink.innerHTML.trim() + "\",\"" + layerTrs[i].cells[2].innerHTML.trim() + "\",\"" + layerTrs[i].cells[4].innerHTML.trim() + "\",\"" + fileId + "\",\"" + fileName + "\"\n");
                                // file id is at the end of fileLink.href
                                // for example
                                // http://learn.tsinghua.edu.cn/uploadFile/downloadFile_student.jsp?module_id=322&filePath=QJaar7Cb7HQGihH%2BE0UUI/n554wng1g0W2xzkl6BxyIEt87lL4jhzbmIxh89tBHgLPyC8n4Q7r9p%2BlRbU3mNxmwWRz3Uk6P%2B%2BaxWvoAjmt2GYgPWUOO9zm6fWQkmlNTK7datTNbLXIU%3D&course_id=${course_id}&file_id=${file_id}
                                WLXTUtils.kcwjList[WLXTUtils.kcwjListInd] = fileLink.href.trim();
                                WLXTUtils.kcwjListInd += 1;
                            }
                        }
                        curLayer += 1;
                        dlTable = aEvent.target.getElementById("Layer" + curLayer.toString());
                    }

                    converter.close();

                    WLXTUtils.kcwjListInd = 0;

                    WLXTUtils.kcwjListWin = aEvent.target.defaultView;

                    var dlProgress = WLXTUtils.kcwjListWin.document.createElement("div");
                    dlProgress.setAttribute("id", "wlxt_dl_progress");
                    var info_1 = WLXTUtils.kcwjListWin.document.getElementById("info_1");
                    var parentDiv = info_1.parentNode;
                    parentDiv.insertBefore(dlProgress, info_1);

                    document.dispatchEvent(new Event("kcwjDl"));
                    break;

                case WLXT.DownloadData.PageType.WARE_LIST:

                    var dlFile = WLXTUtils.dlHelper[pageType.id].dir.clone();
                    dlFile.append("jxzy.html");
                    if (!dlFile.exists()) {
                        dlFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                    }

                    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    foStream.init(dlFile, -1, parseInt("0600", 8), 0);
                    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                    converter.init(foStream, "UTF-8", 0, 0);

                    converter.writeString(aEvent.target.body.innerHTML);

                    converter.close();

                    document.dispatchEvent(new Event("openCourse"));
                    aEvent.target.defaultView.close();
                    var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                    domWindowUtils.garbageCollect();

                    break;

                case WLXT.DownloadData.PageType.HOM_WK_BRW:
                    var hwRows = aEvent.target.getElementsByTagName("tbody")[2].rows;
                    if (hwRows.length > 1) {

                        WLXTUtils.dlHelper[pageType.id].kczyDir = WLXTUtils.dlHelper[pageType.id].dir.clone();
                        WLXTUtils.dlHelper[pageType.id].kczyDir.append("kczy");
                        if (!WLXTUtils.dlHelper[pageType.id].kczyDir.exists()) {
                            WLXTUtils.dlHelper[pageType.id].kczyDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0700", 8));
                        }

                        var dlInfoFile = WLXTUtils.dlHelper[pageType.id].kczyDir.clone();
                        dlInfoFile.append("kczy.csv");
                        if (!dlInfoFile.exists()) {
                            dlInfoFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                        }

                        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                        foStream.init(dlInfoFile, -1, parseInt("0600", 8), 0);
                        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                        converter.init(foStream, "UTF-8", 0, 0);

                        WLXTUtils.kczyList = new Array();
                        WLXTUtils.kczyListInd = 0;
                        for (var i = 0; i != hwRows.length - 1; ++i) {
                            var idRegex = /\?id\=(\d+)&course_id\=(\d+)&/;
                            var idExec = idRegex.exec(hwRows[i].cells[0]
                            .getElementsByTagName("a")[0].href);
                            var hwId = idExec[1];
                            var courseId = idExec[2];

                            WLXTUtils.kczyList[i] = {
                                URL : hwRows[i].cells[0].getElementsByTagName("a")[0].href,
                                courseId : courseId,
                                hwId : hwId,
                                secondPageDisabled : hwRows[i].cells[5]
                                .getElementsByTagName("input")[1].disabled,

                                /*
                                 * there 2 pages to download from so use this to keep
                                 * track
                                 */
                                curPage : 0,
                            };
                            converter.writeString("\"" + hwRows[i].cells[0]
                            .getElementsByTagName("a")[0].innerHTML.trim() + "\",\"" + hwRows[i].cells[1].innerHTML.trim() + "\",\"" + hwRows[i].cells[2].innerHTML.trim() + "\",\"" + hwId + "\"\n");
                        }

                        converter.close();

                        document.dispatchEvent(new Event("kczyDl"));

                    } else {
                        document.dispatchEvent(new Event("openCourse"));
                    }
                    aEvent.target.defaultView.close();
                    var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                    domWindowUtils.garbageCollect();
                    break;

                case WLXT.DownloadData.PageType.HOM_WK_BRW_0:
                    WLXTUtils.dlHelper[pageType.id].kczyHwDir = WLXTUtils.dlHelper[pageType.id].kczyDir.clone();
                    WLXTUtils.dlHelper[pageType.id].kczyHwDir.append(pageType.hwId);
                    if (!WLXTUtils.dlHelper[pageType.id].kczyHwDir.exists()) {
                        WLXTUtils.dlHelper[pageType.id].kczyHwDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0700", 8));
                    }

                    var outFile = WLXTUtils.dlHelper[pageType.id].kczyHwDir.clone();
                    outFile.append("neirong.html");
                    if (!outFile.exists()) {
                        outFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                    }

                    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    foStream.init(outFile, -1, parseInt("0600", 8), 0);
                    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                    converter.init(foStream, "UTF-8", 0, 0);

                    var hwInfo = aEvent.target.getElementById("table_box");
                    converter.writeString(hwInfo.innerHTML);

                    converter.close();

                    WLXTUtils.kczyFiles = new Array(2);
                    WLXTUtils.kczyFilesInd = 0;
                    WLXTUtils.kczyFiles[0] = null;
                    WLXTUtils.kczyFiles[1] = null;

                    WLXTUtils.kczyFilesWin = aEvent.target.defaultView;

                    var tableRows = hwInfo.getElementsByTagName("tr");
                    var infoLink = tableRows[2].getElementsByTagName("a");
                    if (infoLink.length != 0) {
                        WLXTUtils.kczyFiles[0] = infoLink[0].href;
                    }
                    var hwLink = tableRows[5].getElementsByTagName("a");
                    if (hwLink.length != 0) {
                        WLXTUtils.kczyFiles[1] = hwLink[0].href;
                    }

                    var dlProgress = WLXTUtils.kczyFilesWin.document.createElement("div");
                    dlProgress.setAttribute("id", "wlxt_dl_progress");
                    var info_1 = WLXTUtils.kczyFilesWin.document.getElementById("info_1");
                    var parentDiv = info_1.parentNode;
                    parentDiv.insertBefore(dlProgress, info_1);

                    document.dispatchEvent(new Event("kczyDlFiles"));
                    break;

                case WLXT.DownloadData.PageType.HOM_WK_BRW_1:
                    var outFile = WLXTUtils.dlHelper[pageType.id].kczyHwDir.clone();
                    outFile.append("pingyue.html");
                    if (!outFile.exists()) {
                        outFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                    }

                    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    foStream.init(outFile, -1, parseInt("0600", 8), 0);
                    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                    converter.init(foStream, "UTF-8", 0, 0);

                    var hwInfo = aEvent.target.getElementById("table_box");
                    converter.writeString(hwInfo.innerHTML);

                    converter.close();

                    WLXTUtils.kczyListInd += 1;
                    document.dispatchEvent(new Event("kczyDl"));
                    aEvent.target.defaultView.close();
                    var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                    domWindowUtils.garbageCollect();
                    break;

                // case WLXT.DownloadData.PageType.BBS_ID_STUDENT:
                // break;
                /*
                 * nobody uses this
                 */

                case WLXT.DownloadData.PageType.TALKID_STUDENT:
                    var tbodyS = aEvent.target.getElementById("Layer1").getElementsByTagName("tbody");
                    if (tbodyS.length == 2 &&

                    /*
                     * 文化素质讲座 课程讨论 javascript injection problems
                     */
                    pageType.id != "86947") {

                        var discRows = tbodyS[1].rows;
                        WLXTUtils.kctlList = new Array(discRows.length);
                        WLXTUtils.kctlListInd = 0;

                        WLXTUtils.dlHelper[pageType.id].kctlDir = WLXTUtils.dlHelper[pageType.id].dir.clone();
                        WLXTUtils.dlHelper[pageType.id].kctlDir.append("kctl");
                        if (!WLXTUtils.dlHelper[pageType.id].kctlDir.exists()) {
                            WLXTUtils.dlHelper[pageType.id].kctlDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0700", 8));
                        }

                        var dlInfoFile = WLXTUtils.dlHelper[pageType.id].kctlDir.clone();
                        dlInfoFile.append("kctl.csv");
                        if (!dlInfoFile.exists()) {
                            dlInfoFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                        }

                        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                        foStream.init(dlInfoFile, -1, parseInt("0600", 8), 0);
                        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                        converter.init(foStream, "UTF-8", 0, 0);

                        for (var i = 0; i != discRows.length; ++i) {
                            var discIdRegex = /bbs_id\=\d+&course_id\=\d+&id\=(\d+)&/;
                            var discId = discIdRegex.exec(discRows[i].cells[0]
                            .getElementsByTagName("a")[0].href)[1];
                            converter.writeString("\"" + discRows[i].cells[0]
                            .getElementsByTagName("a")[0].innerHTML.trim() + "\",\"" + discRows[i].cells[1].innerHTML + "\",\"" + discRows[i].cells[2].innerHTML + "\",\"" + discRows[i].cells[3].innerHTML + "\",\"" + discId + "\"\n");
                            WLXTUtils.kctlList[i] = discRows[i].cells[0]
                            .getElementsByTagName("a")[0].href;
                        }

                        converter.close();

                        document.dispatchEvent(new Event("kctlDl"));
                    } else {
                        document.dispatchEvent(new Event("openCourse"));
                    }
                    aEvent.target.defaultView.close();
                    var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                    domWindowUtils.garbageCollect();
                    break;

                case WLXT.DownloadData.PageType.TALKID_STUDENT_0:
                    var discFile = WLXTUtils.dlHelper[pageType.id].kctlDir.clone();
                    discFile.append(pageType.discId + ".html");
                    if (!discFile.exists()) {
                        discFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, parseInt("0600", 8));
                    }

                    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    foStream.init(discFile, -1, parseInt("0600", 8), 0);
                    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
                    converter.init(foStream, "UTF-8", 0, 0);

                    converter.writeString(aEvent.target.body.innerHTML);

                    converter.close();

                    document.dispatchEvent(new Event("kctlDl"));

                    aEvent.target.defaultView.close();
                    var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                    domWindowUtils.garbageCollect();

                    break;

                // case WLXT.DownloadData.PageType.DISCUSS_MAIN:
                // break;
                /*
                 * nobody uses this
                 */

                default:
                    break;

            }

            break;

    }
};

WLXT.DownloadData.init = function() {
    if (gBrowser) {
        gBrowser.addEventListener("DOMContentLoaded", WLXT.DownloadData.onPageLoad, false);
    }
};

/*
 * open learn.tsinghua.edu.cn in a new window
 */
WLXT.DownloadData.openLearn = function() {

    window.open("http://learn.tsinghua.edu.cn", "wlxt_login_window", WLXT.DownloadData.strWindowFeatures);
};

window.addEventListener("load", function load(event) {
    window.removeEventListener("load", load, false);
    // remove listener, no longer needed
    WLXT.DownloadData.init();
}, false);

document.addEventListener("openCourse", function(aEvent) {
    if (WLXTUtils.courseListInd == WLXTUtils.courseList.length) {
        window.openDialog("chrome://wangluoxuetang/content/finishReminder.xul", "wlxt-finish-reminder", "chrome,centerscreen");
        return;
    }

    WLXT.DownloadData.downloadClass(WLXTUtils.courseList[WLXTUtils.courseListInd]);
}, false);

document.addEventListener("kcggDl", function(aEvent) {
    if (WLXTUtils.kcggListInd != WLXTUtils.kcggList.length) {
        window.open(WLXTUtils.kcggList[WLXTUtils.kcggListInd].URL);
        WLXTUtils.kcggListInd += 1;
    } else {
        document.dispatchEvent(new Event("openCourse"));
    }
}, false);

document.addEventListener("kcwjDl", function(aEvent) {

    if (WLXTUtils.kcwjListInd == WLXTUtils.kcwjList.length) {
        document.dispatchEvent(new Event("openCourse"));
        WLXTUtils.kcwjListWin.close();
        var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
        domWindowUtils.garbageCollect();
        return;
    }

    Task.spawn(function() {
        /*
         * download
         */

        var idsRegex = /&course_id\=(\d+)&file_id\=(\d+)/;
        var idsRegexExec = idsRegex.exec(WLXTUtils.kcwjList[WLXTUtils.kcwjListInd]);
        var courseId = idsRegexExec[1];
        var fileId = idsRegexExec[2];

        var dlFile = WLXTUtils.dlHelper[courseId].kcwjDir.clone();
        dlFile.append(fileId);

        var list = yield Downloads.getList(Downloads.ALL);

        var progressElement = WLXTUtils.kcwjListWin.document.getElementById("wlxt_dl_progress");
        var view = {
            onDownloadAdded : function(download) {
                progressElement.textContent = "Download started: " + download.source.url + " " + download.target.path;
            },
            onDownloadChanged : function(download) {
                var date = new Date();
                progressElement.textContent = date.toString() + " Download in progress: " + download.source.url + " " + download.target.path;
            },
            onDownloadRemoved : function(download) {
                progressElement.textContent = "Download ended: " + download.source.url + " " + download.target.path;
            },
        };
        yield list.addView(view);

        var download = yield Downloads.createDownload({
            source : WLXTUtils.kcwjList[WLXTUtils.kcwjListInd],
            target : dlFile,
        });
        download.tryToKeepPartialData = true;

        list.add(download);
        yield download.start();
        yield list.removeView(view);

        WLXTUtils.kcwjListInd += 1;

        var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
        domWindowUtils.garbageCollect();

        document.dispatchEvent(new Event("kcwjDl"));

    }).then(null, function(e) {
        /*
         * onReject
         */

        var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
        domWindowUtils.garbageCollect();
        document.dispatchEvent(new Event("kcwjDl"));
    });

}, false);

document.addEventListener("kczyDl", function(aEvent) {
    if (WLXTUtils.kczyListInd == WLXTUtils.kczyList.length) {
        document.dispatchEvent(new Event("openCourse"));
        return;
    }

    switch (WLXTUtils.kczyList[WLXTUtils.kczyListInd].curPage) {
        case 0:
            window.open(WLXTUtils.kczyList[WLXTUtils.kczyListInd].URL);
            WLXTUtils.kczyList[WLXTUtils.kczyListInd].curPage += 1;
            break;

        case 1:
            if (!WLXTUtils.kczyList[WLXTUtils.kczyListInd].secondPageDisabled) {
                window.open("http://learn.tsinghua.edu.cn/MultiLanguage/lesson/student/hom_wk_view.jsp?id=" + WLXTUtils.kczyList[WLXTUtils.kczyListInd].hwId + "&course_id=" + WLXTUtils.kczyList[WLXTUtils.kczyListInd].courseId);
                WLXTUtils.kczyList[WLXTUtils.kczyListInd].curPage += 1;
            } else {
                WLXTUtils.kczyListInd += 1;
                document.dispatchEvent(new Event("kczyDl"));
            }
            break;

        default:
            break;
    }
}, false);

document.addEventListener("kczyDlFiles", function(aEvent) {
    if (WLXTUtils.kczyFilesInd < 2) {
        if (WLXTUtils.kczyFiles[WLXTUtils.kczyFilesInd] != null) {

            Task.spawn(function() {
                /*
                 * download
                 */

                var dlFile = WLXTUtils.dlHelper[WLXTUtils.kczyList[WLXTUtils.kczyListInd].courseId].kczyHwDir.clone();
                dlFile.append((WLXTUtils.kczyFilesInd == 0) ? "neirong" : "tijiao");

                var list = yield Downloads.getList(Downloads.ALL);

                var progressElement = WLXTUtils.kczyFilesWin.document.getElementById("wlxt_dl_progress");
                var view = {
                    onDownloadAdded : function(download) {
                        progressElement.textContent = "Download started: " + download.source.url + " " + download.target.path;
                    },
                    onDownloadChanged : function(download) {
                        var date = new Date();
                        progressElement.textContent = date.toString() + " Download in progress: " + download.source.url + " " + download.target.path;
                    },
                    onDownloadRemoved : function(download) {
                        progressElement.textContent = "Download ended: " + download.source.url + " " + download.target.path;
                    },
                };
                yield list.addView(view);

                var download = yield Downloads.createDownload({
                    source : WLXTUtils.kczyFiles[WLXTUtils.kczyFilesInd],
                    target : dlFile,
                });
                download.tryToKeepPartialData = true;

                list.add(download);
                yield download.start();
                yield list.removeView(view);

                WLXTUtils.kczyFilesInd += 1;

                var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                domWindowUtils.garbageCollect();

                document.dispatchEvent(new Event("kczyDlFiles"));

            }).then(null, function(e) {
                /*
                 * onReject
                 */

                var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
                domWindowUtils.garbageCollect();
                document.dispatchEvent(new Event("kczyDlFiles"));
            });

        } else {
            WLXTUtils.kczyFilesInd += 1;
            document.dispatchEvent(new Event("kczyDlFiles"));
        }

    } else {
        document.dispatchEvent(new Event("kczyDl"));
        WLXTUtils.kczyFilesWin.close();
        var domWindowUtils = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
        domWindowUtils.garbageCollect();
    }
}, false);

document.addEventListener("kctlDl", function(aEvent) {
    if (WLXTUtils.kctlListInd == WLXTUtils.kctlList.length) {
        document.dispatchEvent(new Event("openCourse"));
        return;
    }
    window.open(WLXTUtils.kctlList[WLXTUtils.kctlListInd]);
    WLXTUtils.kctlListInd += 1;
}, false);

