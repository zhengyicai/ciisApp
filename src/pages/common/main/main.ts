import { Component } from "@angular/core";
import { Router,ActivatedRoute } from '@angular/router';
import {Utils} from "../../../providers/Utils";
import {HttpService} from "../../../providers/HttpService";

declare var $: any;
declare var layer: any;
let _router: any;
@Component({
    selector   : 'page-main',
    templateUrl: './main.html',
    styleUrls: ['./main.scss']
})
export class MainPage {
    linkCls:string='';
    userImg:string = "/assets/images/avatar.png";
    userName:string = '';
    menuParent = "我的桌面";
    menuName = "首页";
    refreshLink ='desktop/home';
    menuDatas:any;
    parentMenuData:any;
    constructor(private router:Router,private aroute:ActivatedRoute,private httpService:HttpService) {
        _router = router;
        //获取用户信息
        this.loadUser();
    }

    loadUser(){
        this.httpService.get({
            url:'/cms/user/findUser',
            data:{}
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.userName = data.data.userName;
                //加载菜单
                this.loadMenu(data.data.roleId);
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    loadMenu(roleId:string){
        this.httpService.get({
            url:'/cms/main/findMenu',
            data:{roleId:roleId}
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.menuDatas = data.data;
                this.parentMenuData = this.getParentMenu();
                setTimeout(()=>{
                    $("#menu").metisMenu();
                },100);
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    getParentMenu(){
        return this.getChilderMenu(this.getRootId());
    }

    getRootId(){
        for(var o in this.menuDatas){
            if(this.menuDatas[o].parentId==='0'){
                return this.menuDatas[o].id;
            }
        }
        return null;
    }

    getChilderMenu(pid:string){
        let lis = [];
        for(var o in this.menuDatas){
            if(this.menuDatas[o].parentId===pid){
                lis.push(this.menuDatas[o]);
            }
        }
        return lis;
    }


    ngOnInit(){
        $("body").removeClass("loginBody");
    }

    displayMenu(){
        if(this.linkCls==='open'){
            this.linkCls = '';
            $("body").removeClass("big-page");
        } else {
            this.linkCls = 'open';
            $("body").addClass("big-page");
        }
    }

    loginOut(){
        layer.confirm('你确定要退出系统？', {
            btn: ['确定','取消'] //按钮
        }, function(idx:number){
            _router.navigate(['common/login']); //确认
            layer.close(idx);
        }, function(){
            //取消
        });
    }

    showTitle(menuParent:string,menuName:string,refreshLink:string){
        this.menuParent = menuParent;
        this.menuName = menuName;
        this.refreshLink = refreshLink;
        this.router.navigate(['common/main/'+refreshLink]);
    }

}
