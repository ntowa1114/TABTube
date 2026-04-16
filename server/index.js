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
  console.log('DB接続に成功しました!');
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
    const {search, type, instrument} = req.query; //クエリパラメータを受け取る

    try{
        console.log('DBにクエリを送信')
        let queryText = 'SELECT * FROM videos';
        let values = []; //検索ワード
        let conditions = []; //検索条件配列
        
        //検索ワードからSQLを動的に作成
        if(search){ //検索ワードが入ってるとき
            console.log(`検索ワードの確認を行っています`);
            if(type == 'title' ){
                console.log(`曲名で検索を行います`);
                conditions.push(`title ILIKE $${conditions.length + 1}`);
                values.push(`%${search}%`);
            }else if(type == 'artist' ){
                console.log(`アーティスト名で検索を行います`)
                conditions.push(`artist_name ILIKE $${conditions.length + 1}`);
                values.push(`%${search}%`);
            }
            
        }
        
        if(instrument && instrument != 'all'){
            conditions.push(`instrument = $${conditions.length +1}`);
            values.push(instrument);
        }

        if (conditions.length > 0){
            queryText += ' WHERE ' + conditions.join(' AND ');
        }
        queryText +=' ORDER BY created_at DESC';
        console.log('実行されるSQL文:',queryText);
        const result =await pool.query(queryText, values); //videosテーブルからqueryTextで作成した条件のSQLで取得してcreated_at(作成日)の新しい順(降順DESC)

        console.log('DBからデータを受信しました',result.rows.length,'件');
        res.json(result.rows);        
    }catch(err){
        console.error('クエリ実行中にエラーが発生',err);
        res.status(500).json([]);
    }
})


//サーバーの起動
app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});