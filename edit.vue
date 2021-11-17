<template>
    <div class="text-little-padding">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>Article Management</el-breadcrumb-item>
            <el-breadcrumb-item>Review Article</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="count">Words count：<span>{{textCount || 0}}</span></div>
        <section class="content" v-loading.fullscreen.lock="loading" element-loading-text="Loading desperately" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
            <el-row :gutter="0">
                <el-col :span="12">
                    <el-card class="box-card x-drawer" style="overflow:auto">
                        <div class="container">
                            <h1 class="article-title">
                                {{ postData.title }}
                            </h1>
                            <div class="author-wrap">
                                <a class="author-portrait" href="#" :style="{ backgroundImage:'url('+postData.profile+')' }"></a>
                                <a class="author-text" href="#">
                                    <p class="source-name">{{ postData.pgcName }}</p>
                                    <p class="author-time">{{ postData.publishTime }}</p>
                                </a>
                                <button class="author-follow-btn">
                                    <span class="author-follow-btn-icon">+</span>&nbsp;Follow
                                </button>
                            </div>
                            <div id="article" v-search>
                                <!-- 图文的预览 -->
                                <div id="articleContent" v-if="postData.contentStyle === 1" v-html="postData.content">
                                    {{ postData.content }}
                                </div>
                                <!-- 图集的预览 -->
                                <div v-else-if="postData.contentStyle === 5">
                                    <div v-for="(item,index) in postData.album" :key="index">
                                        <div class="fixed-img-container">
                                            <img :src="item.imgurl" alt=""/>
                                        </div>
                                        <div class="article-text">
                                            {{ item.desc }}
                                        </div>
                                    </div>
                                </div>
                                <!-- 视频的预览 -->
                                <div v-else>
                                    <div class="fixed-img-container">
                                        <video crossorigin="anonymous" :src="postData.videoSrc" controls>
                                            <source :src="postData.videoSrc">
                                            Sorry, your browser doesn't support embedded videos.
                                        </video>
                                    </div>
                                </div>
                            </div>
                            <div id="author">
                                by {{ postData.author }}
                            </div>
                            <el-divider content-position="left">Cover pictures</el-divider>
                            <div class="stamp">
                                <el-image v-for="(image, index) in postData.thumbnails" :key="index" style="width: 210px; height: 140px; padding-right: 2px;" :src="image" fit="cover" :preview-src-list="postData.thumbnails" lazy>
                                </el-image>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="12">
                        <div class="right-body" style="position: absolute; padding-bottom: 50px; width: 45%; padding-top: 20px; ">
                            <el-form ref="form" :model="postData" label-width="100px" style="padding-right: 20px; padding-left: 20px;">
                                <el-form-item label="Topic">
                                    <el-input v-model="postData.topicName" disabled></el-input>
                                </el-form-item>
                                <el-form-item label="Repeat News" v-if="postData.simCheckRes && postData.simCheckRes.length > 0">
                                    <div v-for="s in postData.simCheckRes" :key="s.id" style="display:flex; justify-content: space-between;">
                                        <el-button type="text" @click="handlePreviewRepeat(s)">newsId: {{s.id}}</el-button>
                                        <span>{{s.score * 100 + '%'}}</span>
                                    </div>
                                </el-form-item>
                            </el-form>
                            <el-form label-width="100px" style="padding-right: 20px; padding-left: 20px" :rules="rules" :model="formData" ref="ruleForm">
                                <el-form-item prop="category" label="Category">
                                    <el-cascader v-model="formData.category" :options="newCategoryOptions" @change="handleCategroyChange" clearable>
                                    </el-cascader>
                                </el-form-item>
                                <!-- <el-form-item label="HashTag">
                                    <el-tag class="tagItem" v-for="t in hashTagList" effect="plain" :key="t.id" type="info">{{t.name}}</el-tag>
                                </el-form-item> -->
                                <el-form-item label="Tags">
                                    <el-form :model="tagsResult" ref="tagsResultForm" label-width="auto" size="mini">
                                        <el-form-item v-for="type in tagsList" :key="type.type_id" :label="type.type_name" :prop="''+type.type_id" :rules="[
                                            { required : type.required === 1, message: type.type_name + ' is required', trigger: 'change' }
                                        ]">
                                            <el-radio-group v-if="type.multiple === 0" v-model="tagsResult[type.type_id]" @change="handleTagChange">
                                                <el-radio v-for="t in type.tags" :key="t.id" :label="t.id">{{t.name}}</el-radio>
                                            </el-radio-group>
                                            <el-checkbox-group v-else v-model="tagsResult[type.type_id]" @change="handleTagChange">
                                                <el-checkbox v-for="t in type.tags" :key="t.id" :label="t.id">{{t.name}}</el-checkbox>
                                            </el-checkbox-group>
                                        </el-form-item >
                                    </el-form>
                                </el-form-item>
                                <el-form-item label="Opinions" prop="status">
                                    <el-select v-model="formData.status" placeholder="Select review opinion" @change="reviewOpinions">
                                        <el-option v-for="item in reviewOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Last Note">
                                    <el-input type="textarea" placeholder="none" autosize :value="lastFeedback" :disabled="true"></el-input>
                                </el-form-item>
                                <el-form-item label="Notes">
                                    <el-input type="textarea" v-model="formData.feedback" placeholder="Comment on the article" @focus="handleReasonDialogShow"></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="reviewPost">Confirm</el-button>
                                    <el-button type="info" @click="reviewList">Return</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                </el-col>
            </el-row>
        </section>
        <el-dialog :title="reasonsTitle" :visible.sync="reasonDialogShow" center width="500px">
            <el-radio-group class="dialogRadio" v-model="reasonResult">
                <ul class="reason-list">
                    <li class="reason-item" v-for="r in reasonList" :key="r.value">
                        <el-radio :label="r.value">{{r.label}}</el-radio>
                    </li>
                    <li class="reason-item" v-show="reasonResult === 0">
                        <el-input v-model="customReason" placeholder="Other Reason"></el-input>
                    </li>
                </ul>
            </el-radio-group>
            <span slot="footer" class="dialog-footer">
                <el-button @click="reasonDialogShow = false">Cancel</el-button>
                <el-button type="primary" @click="handleReasonDialogSubmit">Ok</el-button>
            </span>
        </el-dialog>
        <el-drawer custom-class="preview-drawer" :visible.sync="drawerShow" size="40%" @closed="handleDrawerClose" ref="drawerDom" :withHeader="false">
            <div style="width: 90%;margin:5vh 5%;height: 90vh;overflow-y:scroll">
                <iframe style="width: 100%; height: 100%" v-if="simNewsUrl" :src="simNewsUrl" frameborder="0"></iframe>
                <preview v-if="repeatNews" :postData="repeatNews"/>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import "../../assets/icon/iconfont.css";
import { reviewApi, reviewPostApi, getTags } from '~/api/api.js';
import { getArticleDetail } from '~/api/appeal-list';
import textSearch from '~/directives/text-search';
import getReasonData from './reasonData';
import preview from './preview';
export default {
    name: 'postPrv',
    props:{
        header:{
            default: true
        }
    },
    directives: {
        'search': textSearch
    },
    components: {
        preview
    },
    data() {
        return {
            reviewOptions: this.GLOBAL.reviewOptions,
            loading: false,
            postData:{
                title: "",
                contentStyle: 1,
                author: "",
                pgcName: "",
                publishTime: "",
                profile: "",
                content: "",
                topicName: '',
                thumbnails: [],
                videoSrc: "",
                album: [],
                outText: "",
            },
            tagsList: [],
            tagsResult: {},
            reasonDialogShow: false,
            reasonsTitle: 'Reject Reasons',
            reasonList: [],
            customReason: '',
            reasonResult: '',
            formData: {
                status: "",
                feedback: "",
                reviewId: "",
                postId: "",
                category: "",
                cTag: "",
                categoryType: "",
                hashTags: "",
                filterCategory: '',
                tags: ''
            },

            rules: {
                status: [{ required: true, message: 'Review status is required', trigger: 'change' }],
                category: [{ type: 'array', required: true, message: 'Category is required', trigger: 'change' }]
            },
            repeatNews: null,
            simNewsUrl: '',
            drawerShow: false,
            lastFeedback: '',
            textCount: '',
        }
    },
    computed: {
        userInfo: function() {
            return this.$store.state.index.userInfo;
        },
        tagList() {
            if(this.formData.hashTags) {
                let arr = JSON.parse(this.formData.hashTags);
                return arr.map(item => {
                    let {id, name} = item;
                    return { id, name };
                })
            }
            return [];
        },
        newCategoryOptions() {
            let localCategoryList = this.$store.state.index.categoryList;
            let globalCategoryList = this.$store.state.index.globalCategoryList;
            return [
                { label: "Local", value: 1,  children: localCategoryList },
                { label: "Global", value: 2, children: globalCategoryList },
            ]
        }
    },
    created() {
        this.getData();
        this.getTagsData();
    },
    mounted() {
        this.setReviewStyle();
    },
    updated() {
        if(document.getElementById('articleContent')) {
            let length =  document.getElementById('articleContent').innerText.replace(/\n/g, ' ').split(' ').filter(str => str).length
            this.textCount = length
        };
        Array.from(document.getElementsByTagName('VIDEO')).forEach(node => {
            node.onclick = () => {
                window.open(node.src);
            }
            //如果视频可以加载，则不跳转
            node.onloadedmetadata = () => {
                node.onclick = null;
            };
        });
    },
    watch: {
        $route(to, from) {
            if (this.$route.query.reviewId) {
                this.formData.status = "";
                this.formData.feedback = "";
                this.getData();
            }
        },
        tagsList: {
            handler(){
                this.setTagsResult()
            },
            immediate: true
        },
        'formData.tags': {
            handler() {
                this.setTagsResult()
            }
        }
    },
    methods:{
        handleTagChange() {
            let arr = [];
            for(let key in this.tagsResult) {
                let value = this.tagsResult[key];
                if(Array.isArray(value)) {
                    if(value.length > 0) arr = [...arr, ...value]
                } else if(value){
                    arr.push(value)
                }
            }
            this.formData.tags = arr.join(',');
        },
        handleDrawerClose() {
            this.simNewsUrl = '';
            this.repeatNews = null;
        },
        handlePreviewRepeat(news) {
            this.drawerShow = true;
            this.previewRepeat = news;
            if(news.key_type === 0) {
                this.simNewsUrl = `http://cdn1.scooper.news/static/half/detail/${Math.ceil(news.id/5000)}/${news.id}.html`;
            } else {
                this.getPostData({id: news.id});
            }
        },
        getPostData(params) {
                getArticleDetail(params).then(res => {
                    let { code, data } = res;
                    if(code !== 1000) {
                        this.$message.error(res.message);
                    } else {
                        this.repeatNews = data;
                    }
                })
            },
        setTagsResult() {
            this.tagsList.forEach(item => {
                let value = item.multiple === 0? '': [];
                item.tags.forEach(innerItem => {
                    if(this.formData.tags.indexOf(innerItem.id) > -1) {
                        item.multiple === 0? value = innerItem.id: value.push(innerItem.id);
                    }
                })
                this.$set(this.tagsResult, item.type_id, value)
            })
        },
        handleReasonDialogShow() {
            if(this.formData.status === 4 || this.formData.status === 5) {
                this.reasonList = getReasonData(this.formData.status, this.userInfo.language);
                this.reasonsTitle = 'Reasons';
                this.reasonDialogShow = true;
            } else {
                return;
            }
        },
        getTagsData() {
            getTags().then(res => {
                let { code, message, data } = res;
                if(code === 1000) {
                    this.tagsList = data.filter(item => item.tags);
                } else {
                    this.$message.error(message);
                }
            }).catch(err => {
                this.$message.error(err.message);
            })
        },
        handleReasonDialogSubmit() {
            if(this.reasonResult === '') {
                this.$message.error('Reason must be choice!');
                return;
            };
            this.formData.feedback = this.reasonResult === 0? this.customReason: this.reasonList.find(item => item.value === this.reasonResult).label;
            this.reasonDialogShow = false;
        },
        handleCategroyChange() {
            this.formData.hashTags = "";
        },
        getData() {
            this.loading = true;
            reviewApi({ postId: this.$route.path.split("/")[2], reviewId: this.$route.query.reviewId }).then(res => {
                this.loading = false;
                if (res) {
                    let { code, message, data } = res;
                    if (code !== 1000) {
                        this.$message.error(message);
                        this.$router.push(`/posts/prv`);
                    } else {
                        this.postData = data;
                        
                        this.postData.thumbnails = data.thumbnails.split(",");
                        this.formData.category = [data.categoryType, data.cTag];
                        this.formData.hashTags = data.hashTags;
                        this.formData.tags = data.tags || '';
                        this.lastFeedback = data.feedback;
                        if (this.postData.contentStyle === 5) {
                            this.postData.album = JSON.parse(data.content);
                        } else if (this.postData.contentStyle !== 1) {
                            let videoInfo = JSON.parse(data.content);
                            this.postData.videoSrc = videoInfo.url;
                        }
                    }
                }
            })
        },
        reviewOpinions(val) {
            document.querySelector('.container').classList.remove('loaded');
            document.querySelector('.stamp').classList.remove("approved");
            document.querySelector('.stamp').classList.remove("rejected");
            document.querySelector('.stamp').classList.remove("to-be-revised");

            if (val === 1) {
                document.querySelector('.stamp').setAttribute("class", "stamp approved");
            } else if (val === 4) {
                document.querySelector('.stamp').setAttribute("class", "stamp rejected");
            } else {
                document.querySelector('.stamp').setAttribute("class", "stamp to-be-revised");
            }

            setTimeout(function() {
                document.querySelector('.container').setAttribute('class', 'container loaded');
            }, 500);
            this.reasonList = [];
            this.customReason = '';
            this.reasonResult = '';
        },
        validTagForm() {
            return new Promise(resolve => {
                this.$refs['tagsResultForm'].validate(valid => {
                    if(valid) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                })
            })
        },
        async reviewPost() {
            let result = await this.validTagForm();
            if(!result) return;
            this.$refs['ruleForm'].validate((valid) => {
                if (!valid) {
                    return false;
                } else {

                    if ((this.formData.status === 4 || this.formData.status === 5) && (!this.formData.feedback || this.formData.feedback.length === 0 )) {
                        this.$message.error("Notes cannot be empty");
                        return false;
                    }

                    let tag =  this.tagsList.find(tag => tag.type_name.toLowerCase() == 'indepth story');
                    let name = tag?.tags.find(item => item.id == this.tagsResult[tag.type_id])?.name;
                    this.formData.depth_story = name?.toLowerCase() == 'yes' ? 1 : 0;

                    this.formData.postId = parseInt(this.$route.path.split("/")[2]);
                    this.formData.reviewId = parseInt(this.$route.query.reviewId);
                    this.formData.filterCategory = this.$route.query.categoryName;
                    this.loading = true;

                    this.formData.categoryType = this.formData.category[0];
                    this.formData.cTag = this.formData.category[1];
                    this.formData.categoryName = this.newCategoryOptions[this.formData.categoryType - 1].children.find(item => item.value === this.formData.cTag)?.label;
                    reviewPostApi(this.formData).then(res => {
                        this.loading = false;
                        if (res) {
                            let { code, message, data } = res;
                            if (code !== 1000) {
                                this.$message.error(message);
                            } else {
                                this.$message.success('Success');
                                if (data.nextPostId && data.nextReviewId) {
                                    document.querySelector('.container').classList.remove('loaded');
                                    document.querySelector('.stamp').classList.remove("approved");
                                    document.querySelector('.stamp').classList.remove("rejected");
                                    document.querySelector('.stamp').classList.remove("to-be-revised");
                                    window.scroll({ top: 0 });
                                    if (this.$route.query.reviewType && this.$route.query.reviewType===1) {
                                        this.$router.push(`/posts/prv`);
                                    } else {
                                        if (this.$route.query.categoryName && this.$route.query.categoryName.length > 0) {
                                            this.$router.push({ path: `/post/${data.nextPostId}/prv`, query: { reviewId: data.nextReviewId, categoryName: this.$route.query.categoryName } });
                                        } else {
                                            this.$router.push({ path: `/post/${data.nextPostId}/prv`, query: { reviewId: data.nextReviewId } });
                                        }
                                    }
                                } else {
                                    this.$router.push(`/posts/prv`);
                                }
                            }
                        }
                    });
                }
            });
        },
        setReviewStyle() {
            if (this.userInfo.language === 'ar') {
                document.querySelector('.container').setAttribute("dir", "rtl");
            }
        },
        reviewList() {
            this.$router.push(`/posts/prv`);
        },
    }
}
</script>

<style scoped>
    .count {
        text-align: right;
        font-size: 14px;
        width: 49%;
    }
    .count span {
        color: #0d9928;
        font-weight: 500;
    }
    .dialogRadio.el-radio-group {
        width: 80%;
        display: block;
        margin: 0 auto;
    }
    .el-radio {
        /* display: block; */
        padding: 10px 0;
    }
    .x-drawer{
        margin-left: 5px;
        padding-left: 10px;
        margin-right: 5px;
        /* min-height: 800px; */
        height: 1100px;
    }
    .x-drawer-title i{
        font-size: 24px;
        cursor: pointer;
    }
    a{
        text-decoration: none;
    }
    #paragraphs>a{
        text-decoration: none;
    }
    .author-text {
        outline: none;
        text-decoration: none;
        flex-grow: 1;
        padding: 0 12px;
    }
    .author-text .author-time {
        font-size: 12px;
        color: #9e9e9e;
    }
    .author-text .source-name {
        font-size: 14px;
        color: #9e9e9e;
    }
    .author-portrait{
        width: 32px;
        height: 32px;
        border-radius: 16px;
        overflow: hidden;
        background-size: cover;
        background-position: 50%;
        background-repeat: no-repeat;
    }
    .author-wrap {
        padding-top: 10px;
        height: 32px;
        display: flex;
        align-items: center;
    }
    .author-follow-btn {
        color: #fff;
        outline: 0;
        border-radius: 12px;
        border: none;
        padding: 0 12px;
        font-size: 12px;
        cursor: pointer;
        background-color: #0d9928;
        height: 24px;
    }
    .article-title{
        font-size: 24px;
        font-weight: 700;
        font-family: Roboto-Bold;
        line-height: 32px;
    }
    .fixed-img-container {
        margin: 16px auto 0;
    }
    .fixed-img-container img {
        display: block;
        width: 100%;
    }
    #article {
        padding-top: 20px;
    }
    .article-image {
        padding-top: 10px;
    }
    #article>.article-video {
        margin: 16px auto 0;
    }
    #article p{
        font-size: 18px;
        margin-top: 16px;
        word-break: break-word;
        line-height: 25px;
    }
    #author {
        font-size: 12px;
        color: #bdbdbd;
        font-style: italic;
        margin-top: 10px;
        padding-bottom: 50px;
    }
    .label {
        padding-right: 20px;
    }
    .container {
        -webkit-backface-visibility: hidden;
    }
    .stamp {
        height: 150px;
    }
    .rejected,.approved, .to-be-revised {
        position: relative;
    }
    .rejected:after, .approved:after, .to-be-revised:after {
         border-radius: .2em;
         font-size: 50px;
         font-weight: bold;
         line-height: 1;
         opacity: 0;
         position: absolute;
         padding: .1em .5em;
         margin: 0 auto;
         top: 10%;
         left: 10%;
         text-transform: uppercase;
         opacity: 0;
         transform-origin: 50% 50%;
         transform: rotate(-2deg) scale(5);
         transition: all .3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
     }
    .approved:after {
        border: solid .1em green;
        color: green;
        content: 'approved';
    }
    .to-be-revised:after{
        border: solid .1em yellow;
        color: yellow;
        content: 'to be revised';
    }
    .rejected:after {
        border: solid .1em red;
        color: #d00;
        content: 'rejected';
    }

    .loaded .approved:after, .loaded .rejected:after, .loaded .to-be-revised:after{
        opacity: .75;
        transform: rotate(-15deg) scale(1);
    }
    .article-text {
        font-size: 18px;
        word-break: break-word;
        line-height: 24px;
        padding-top: 20px;
        padding-left: 50px;
        padding-right: 50px;
        width: 80%;
    }
    .circle-wrap{
        height: 200px;
        display: flex;
        width: 100%;
        justify-content: space-between;
    }
    .collapse-wrap{
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 10px;
    }
    .collapse-item-light{
        width: 80%;
        padding: 12px 20px;
        background-color: #ebf1f8;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
    }
    .collapse-item{
        width: 80%;
        padding: 12px 20px;
        background-color: #37c978;
        border-radius: calc(.25rem - 1px) calc(.25rem - 1px) 0 0;
        color: white;
        font-weight: 700;
        display: flex;
        justify-content: space-between;
        cursor: pointer;
    }

    .collapse-item-bottom{
        width: 80%;
        text-align: left;
        padding: 0 20px;
        min-height: unset;
        background-color: #fff;
        box-shadow: 0 0 10px 0 #f1f2f8;
    }
    .pt-2 {
        padding: 8px 0;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
    }
    .icon-back {
        float: right;
        font-size: 30px;
        cursor: pointer;
    }
    .plagiarized-link {
        color: #0053b3;
        font-size: 16px;
        margin-bottom: 10px;
    }
    .plagiarized-link:hover {
        text-decoration: underline;
        text-decoration-color: #0053b3;
    }
    .row {
        flex-direction: column;
    }
    .row:first-child {
        padding-bottom: 10px;
    }
    .source-percentage-total {
        border-radius: 4px;
        color: #fff;
        margin: 0 0 0 15px;
        font-size: 14px;
        height: 25px;
        line-height: 25px;
        width: 45px;
        text-align: center;
        display: inline-block;
        font-weight: 400;
        vertical-align: top;
        background-color: #2447bc;
        background: -webkit-linear-gradient(top left, #333aeb, #5d14d3);
    }
    .match-similarity-score {
        font-size: 14px;
        padding: 0 13px;
        background: #e5e8ec;
        color: #1b1b1e;
        vertical-align: top;
        height: 35px;
        line-height: 35px;
        border-radius: 0 4px 4px 0;
        font-weight: 400;
        text-align: center;
    }
    .match-similarity-score span {
        display: inline-block;
        margin-bottom: 0;
        padding: 0 0 0 7px;
        color: #44464b;
    }
    .source-url.overview {
        margin: 11px 15px 0;
    }
    .source-url:visited {
        color: #5e6376;
    }
    .source-url .spacer {
        padding: 0 5px;
        font-size: 18px;
    }
    .guest-user {
        margin-left: 50px;
    }
    #results-percentage {
        display: none;
        height: 70px;
        padding: 0;
        text-align: center;
        margin: 0 auto 10px;
    }
    #percent-matches {
        font-size: 50px;
        font-weight: 100;
        color: #434859;
        margin: 0 12px 0 5px;
        display: inline-block !important;
        vertical-align: middle;
    }
    .question-tooltip-icon {
        color: #aec1cf;
        cursor: help;
        font-size: .9em;
    }
    .score-super {
        display: inline-block;
        vertical-align: super;
        position: relative !important;
        margin: 0 !important;
        font-size: .4em !important;
        padding-left: 5px;
        color: inherit !important;
    }
    #results-title {
        font-weight: 400;
        color: #fff;
        padding: 10px 15px;
        margin: 0;
        position: relative;
        z-index: 5;
        border-radius: 50px;
        border-bottom: 2px solid #d2dadf;
        background-color: #eaedf2;
        transition: .2s ease;
        font-size: 16px;
    }
    #match-navigator, #num-sources-count, .inlineblock {
        display: inline-block;
    }
    #match-navigator i {
        padding: 0 13px;
        line-height: 37px;
        background: #fff;
        border-radius: 50px;
        
        border: 1px solid transparent;
        box-shadow: 1px 1px 3px #dfdfdf;
        -webkit-box-shadow: 1px 1px 3px #dfdfdf;
        -moz-box-shadow: 1px 1px 3px #dfdfdf;
        -ms-box-shadow: 1px 1px 3px #dfdfdf;
        margin: 0;
        font-size: 18px;
        color: #686c7e;
        transition: all .1s ease;
        cursor: pointer;
        height: 40px;
        width: 40px;

    }
    #current-match-selection {
        width: 45px;
        text-align: center;
        cursor: pointer;
        font-size: 14px;
        color: #434343;
        font-weight: 500;
        padding: 3px;
        border-radius: 4px;
        margin: 0 8px;
        background-color: transparent;
        border: 1px solid transparent;
        display: inline-block;
        transition: all .2s ease;
    }
    #doc-results {
        padding: 30px 10px;
        width: 100%;
        overflow: auto;
        display: block;
        position: relative;
        top: -2px;
    }
    .source {
        padding: 0;
        transition: all .2s ease;
        text-align: left;
    }
    .source .row:first-child {
        padding-bottom: 10px;
    }
    .source-percentage-total {
        border-radius: 4px;
        color: #fff;
        margin: 0 0 0 15px;
        font-size: 14px;
        height: 25px;
        line-height: 25px;
        width: 45px;
        text-align: center;
        display: inline-block;
        font-weight: 400;
        vertical-align: top;
        background-color: #2447bc;
        background: -webkit-linear-gradient(top left, #333aeb, #5d14d3);
    }
    .source-title.open {
        color: #fff;
        max-width: 400px;
        background: #365deb;
        margin: 0 0 0 0;
        padding: 0 15px;
        border-radius: 4px 0 0 4px;
        line-height: 35px;
        height: 35px;
        font-size: 15px;
        vertical-align: top;
        display: inline-block;
    }
    .flex-betw{
        display: flex;
        justify-content: space-between;
    }
    .snippet {
        height: 45vh;
        overflow: auto;
        margin: 10px 0 10px 0;
        font-size: 15px;
        padding: 20px 25px;
        border: 1px solid #EBEEF5;
        border-radius: 4px;
        word-break: break-all;
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        -ms-border-radius: 4px;
        box-shadow: 0 0 10px #0a0a0a12;
        -webkit-box-shadow: 0 0 10px #0a0a0a12;
        -moz-box-shadow: 0 0 10px #0a0a0a12;
        -ms-box-shadow: 0 0 10px #0a0a0a12;
        line-height: 1.7;
        font-family: Nunito, sans-serif;
        background: #fff;
    }
    .snippet .source-url {
        display: inline-block;
        font-size: 16px;
        width: 100%;
        margin: 10px auto;
        line-height: 18px;
        color: #335deb;
        border-color: #335deb;
        border-bottom: 1px solid transparent;
    }
    .ellipsis {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    .tagItem {
        margin-right: 12px;
    }
</style>
