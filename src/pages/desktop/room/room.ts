import { Component } from "@angular/core";

import {HttpService} from "../../../providers/HttpService";
import {Utils} from "../../../providers/Utils";
import { TreeModule } from 'ng2-tree';

declare var $: any;
declare var layer: any;
var nowPage: any;

@Component({
    selector   : 'page-room',
    templateUrl: './room.html',
    styleUrls: ['./room.scss']
})
export class RoomPage {

    datas:any;
    subData:any={};
    tree:any;
    buildingId:string;
    unitId:string;
    constructor(private httpService:HttpService,private utils:Utils) {
        this.httpService.items = null;
        this.httpService.currentPage = 1;
        this.loadTreeData();
        nowPage = this;
    }

    /**
    * 加载小区树型数据
    */
    loadTreeData(){
        this.httpService.get({
            url:'/cms/room/findTree',
            data:{}
        }).subscribe((data:any)=>{
            if(data.code==='0000'){
                this.tree = {
                    settings: {
                        static: true,
                        rightMenu: false,
                        leftMenu: false,
                        cssClasses: {
                            expanded: 'fa fa-caret-down fa-lg',
                            collapsed: 'fa fa-caret-right fa-lg',
                            empty: 'fa fa-caret-right disabled',
                            leaf: 'fa'
                        },
                        templates: {
                            node: '<i class="fa fa-folder-o fa-lg"></i>',
                            leaf: '<i class="fa fa-file-o" fa-lg></i>'
                        }
                    },
                    value: '小区',
                    id: 'root',
                    children: data.data
              };
              for(let a in data.data){
                  let buildings = data.data[a].children;
                  for(let b in buildings){
                      let units = buildings[b].children;
                      this.buildingId =  buildings[b].id;
                      for(let u in units){
                          this.unitId = units[u].id;
                          this.loadRoomData();
                          break;
                      }
                  }
              }
            }else if(data.code==='9999'){
                Utils.show(data.message);
            }else{
                Utils.show("系统异常，请联系管理员");
            }
        });
    }

    /**
    * 选中节点
    */
    onNodeSelected(event:any){
        if(!event.node.children){
            this.httpService.currentPage = 1;
            this.unitId = event.node.node.id;
            this.buildingId = event.node.parent.node.id;
            this.loadRoomData();
        }
    }

    /**
    * 弹出编辑面板
    */
    showEditPanel(item:any){
        this.subData = Utils.copyObject(item);
        layer.open({
            title: "修改房间信息",
            btn: ["保存","退出"],
            type: 1,
            closeBtn: 0,
            shade: 0,
            fixed: true,
            shadeClose: false,
            resize: false,
            area: ['350px','auto'],
            content: $("#editPanel"),
            yes: function(index:number){
                if(nowPage.validator()){
                    nowPage.httpService.post({
                        url:'/cms/room/update',
                        data:nowPage.subData
                    }).subscribe((data:any)=>{
                        layer.closeAll();
                        if(data.code==='0000'){
                            //修改成功
                           layer.msg(data.message,{
                               icon: '1',
                               time: 2000
                           },function(){
                               nowPage.loadRoomData();
                           });
                        }else if(data.code==='9999'){
                            Utils.show(data.message);
                        }else{
                            Utils.show("系统异常，请联系管理员");
                        }
                    });
                }
            }
        });
    }

    /**
    * 加载楼栋数据
    */
    loadRoomData(){
        this.httpService.pagination({
            url:'/cms/room/findRooms',
            data:{
                buildingId:this.buildingId,
                unitId:this.unitId
            }
        });
    }

    validator(){
        if(Utils.isEmpty(this.subData.roomName)){
            layer.tips('房间名不能为空', '#roomName',{tips: 1});
            $("#roomName").focus();
            return false;
        }
        return true;
    }

}
