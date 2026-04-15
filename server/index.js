//express→ サーバーを作るための道具 , pg (Pool)→ PostgreSQL（データベース）と接続するための道具,cors→ 別のURLからのアクセスを許可する仕組み
const express =require('express');
const {Pool} = require('pg');
const cors =require('cors');

const app = express(); //サーバー作る
const PORT =5000; //ポート5000番設定

//ミドルウェア→ブラウザとサーバー処理の間

app.use(cors()); //フロントエンドとバックエンドのポートのつなぎ
app.use(express.json()); //JSON使えるように

//データベース接続設定

const pool = new Pool({
   user: 'postgres',
   host:'localhost' ,
   database:'tabtube_db',
   password:'1114',
   port: 5432
});
// DB接続テスト

pool.connect((err, client, release) => {
  if (err) {
    return console.error('DB接続エラー:', err.stack);
  }
  console.log('DB接続に成功しました！');
});

//---APIの作成---
//バックエンド起動確認
app.get('/',(req,res)=>{ //req(クライアントから来た),res(クライアントに返す), /(トップページ)にアクセスされたとき
    res.send('TABTube Backend is running!')
});
//
//DBから動画一覧を取得
app.get('/api/videos',async(req, res)=>{ ///api/videos にアクセスされたとき
    console.log('APIが叩かれました')
    try{
        console.log('DB二クエリを送信')
        const result =await pool.query('SELECT * FROM videos ORDER BY created_at DESC'); //videosテーブルからすべて取得してcreated_at(作成日)の新しい順(降順DESC)

        console.log('DBからデータを受信しました',result.rows.length,'件');
        res.json(result.rows);        
    }catch(err){
        console.error('クエリ実行中にエラーが発生',err);
        res.status(500).json({error: 'DBエラー(index.jsより)'})
    }
})


//サーバーの起動
app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});