cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    convertFrom45 : function(curTilepos){
        var curTileX = curTilepos.x;
        var curTileY = curTilepos.y;

        var curPosX = 688 - ((12-curTileX )+ (42 - curTileY)) * 32;
        var curPosY = -504 - ((12-curTileX ) - (42 - curTileY)) * 24;
        
        return cc.v2(curPosX,curPosY);
    },

    convertTo45 : function(clickEvent){
        var visibleSize = cc.winSize;
            var oldX = (clickEvent.getLocationX() - visibleSize.width/2)/64;
            var oldY = (clickEvent.getLocationY() - visibleSize.height/2)/48;
            var rawNewX = (oldX + oldY);
            var rawNewY = (oldX - oldY);

          
            var newX = Math.floor(rawNewX) + 1;
            var newY = -Math.floor(-(rawNewY)) - 1;
            
            return {
              newX : newX,
              newY : newY,
            };
    },
    
    convertToPath : function(newPos, curTilePosX,curTilePosY){
        
        var newX = newPos.newX;
        var newY = newPos.newY;
        
        var openList = [];
        var closeList = [];
        var finalList = [];
  
        

        var start = {
            x: curTilePosX,
            y: curTilePosY,
            h: (Math.abs(newX) + Math.abs(newY))*10,
            g: 0,
            p:null,
        };
        start.f = start.h + start.g;
        
        openList.push(start);
        

        
        var desTileX = start.x + newX;
        var desTileY = start.y + newY;

        while(openList.length != 0){
        
        var parent  = openList.shift();
        
        closeList.push(parent);
        
        if(parent.h == 0){break;}
            
            for(var i = -1; i <= 1; i++){
                for(var j = -1; j <= 1; j++){
                    var rawx = parent.x + i;
                    var rawy = parent.y + j;
                    if(this._hadInCloseList(rawx, rawy, closeList)){/*比较G值换P 返回*/ continue;}
                    var neibour = {
                        x: rawx,
                        y: rawy,
                        h: Math.max(Math.abs(rawx - desTileX),Math.abs(rawy - desTileY))*10,
                        g: parent.g + ((i != 0 && j != 0) ? 14 : 10),  
                        p: parent,
                    }
                    
                    neibour.f = neibour.h + neibour.g;
                    
                    openList.push(neibour);
                }
            }
            
            
            
            openList.sort(this._sortF);
        }
        
        
        
        var des = closeList.pop();
       
        while(des.p){
            des.dx = des.x - des.p.x;
            des.dy = des.y - des.p.y;
            finalList.unshift(des);
            des = des.p;
        };
        
        return finalList;

    },
    
    _hadInCloseList : function(x, y, closeList){
        for(var item of closeList){
            if(item.x == x && item.y == y) return true;
        }
        return false;
    },
    
    _sortF : function(a,b){
        return a.f - b.f;
    },
    

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
