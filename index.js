const {app,BrowserWindow,ipcMain}=require('electron')

const path=require('path')
const url=require('url')

// var db=new sqlite.Database('test.db',(err)=>{
//     if (err) {
//         console.log(err);
//     }
// });
// db.serialize(function () {
//     db.run("create table emre (info TEXT)");
// });
// db.close();

let window

function createWindow() {
    win=new BrowserWindow({
        width:1295,
        height:740,
        webPreferences:{
            nodeIntegration:true,//fronted'de require çalışmayınca kullandık
        }
    })

    win.setMenu(null);

    win.loadURL(url.format({
        pathname:path.join(__dirname,'main.html'),
        protocol:'file',
        slashes:true
    }))

    // win.webContents.openDevTools();

    win.on('closed',()=>{
        win=null
    })
}

ipcMain.on('asenkron',(event,arg)=>{
    console.log(arg);

    event.sender.send('asenk-main','Main.js den geldi')
})

app.on('ready',createWindow)

app.on('window-all-closed',()=>{
    if(process.platform!=='darwin'){
        app.quit();
    }
})

app.on('activate',()=>{
    if(win===null){
        createWindow()
    }
})
