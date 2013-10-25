var EXPORTED_SYMBOLS = ["WLXTUtils"];

var WLXTUtils = {

    /*
     * nsIFile for the download directory
     */
    dlDir : null,

    ClassHelper : function() {
        /*
         * download directory for this
         * particular class
         */
        this.dir = null;

        /*
         * 课程公告
         */
        this.kcggDir = null;

        /*
         * 课程文件
         */
        this.kcwjDir = null;
    },

    /*
     * saves download meta info
     * for each class, contains
     * ClassHelper
     */
    dlHelper : {},

    /*
     * stores a list of course to download
     */
    courseList : null,
    courseListInd : null,

    downloadClassPage : 0,

    kcggList : null,
    kcggListInd : null,

    kcwjList : null,
    kcwjListInd : null,
};

