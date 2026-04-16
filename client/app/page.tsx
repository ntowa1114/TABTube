"use client";

import React, { useState, useEffect } from 'react';


export default function Home(){
  const [searchWord, setSearchWord] = useState("");
  const [videos ,setVideos] = useState<any[]>([]);
  const [selectedInstrument,setSelectedInstrument] = useState("all");

  //画面が表示されたとき
  useEffect(()=>{ //useEffectにより変更によるリロードを最小限に抑える
    const fetchVideos =async () =>{
      try{
        const response = await fetch('http://localhost:5000/api/videos'); //httpリクエストを送る
        const data = await response.json(); //レスポンスをjson形式で「data」に保存する
        setVideos(data); //取得したデータを状態変数のvideosに入れる
      }catch(error){
        console.error("データの取得に失敗しました(page.tsxより)",error);
      }
    };
    fetchVideos();
  },[]); //useEffectの引数が[](空配列)だとリロード時一回実行

  const dummyVideos =[
    { id: '1', title: 'Stay Gold', artist: 'Hi-STANDARD', instrument: 'Guitar' },
    { id: '2', title: 'Set the fire', artist: 'SHANK', instrument: 'Bass' }
  ];

  const handleSearch = async (type:'title' | 'artist') =>{
    if(!searchWord){
      // 検索ワードが空なら全件取得に戻す
      const res = await fetch('http://localhost:5000/api/videos');
      const data = await res.json();
      setVideos(data);
      return;
    }
    try{
      const res = await fetch(`http://localhost:5000/api/videos?search=${searchWord}&type=${type}&instrument=${selectedInstrument}`);
      console.log(`http://localhost:5000/api/videos?search=${searchWord}&type=${type}でリクエストを送信しました`)
      const data = await res.json();
      setVideos(data)
    }catch(error){
        console.error("検索に失敗しました",error);
    }
    
  };
  return(
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <img
            src="/logo.png"
            alt="TABTube Logo"
            width={150}
            height={40}
            className="object-contain"
          />
          {/*ヘッダーボタン */}
          <nav className="flex gap-2 mb-6">
            <button className="border px-4 py-1 rounded bg-white shadow-sm">新規掲載</button>
            <button className="border px-4 py-1 rounded bg-white shadow-sm">人気曲</button>
            <button className="border px-4 py-1 rounded bg-white shadow-sm">ログイン</button>
          </nav>
        </div>
      </header>
      <main>
        {/* 検索セクション */}
        <section className="bg-white p-6 rounded-xl shadow-md max-w-2xl mb-10">
          <div>
            <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder ="曲名/アーティスト名を入力..."
            className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 outline-none transition"
            />
            <button
            onClick={()=>handleSearch('title')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">曲名で検索</button>
            <button
            onClick={()=>handleSearch('artist')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              アーティスト名で検索
            </button>
          </div>
          
          <div className="mt-4 flex gap-4 justify-center text-sm">
            <label>
              <input
                type="radio"
                name="instrument"
                checked={selectedInstrument == "all"}
                onChange={()=>setSelectedInstrument("all")}
              />すべて
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="instrument"
                checked={selectedInstrument == "Guitar"}
                onChange={()=>setSelectedInstrument("Guitar")}
              />ギター
            </label>
            <label>
              <input
                type="radio"
                name="instrument"
                checked={selectedInstrument == "Bass"}
                onChange={()=>setSelectedInstrument("Bass")}
              />ベース
            </label>
          </div>
        </section>
        {/*動画一覧 */}
        <section>

          <div>
            <h3 className="text-xl font-bold border-l-4 border-blue-600 pl-3">新着のTAB譜</h3>
            <span className="text-blue-600 text-sm cursor-pointer hover:underline">すべて見る</span>
          </div>
          <div>
            {Array.isArray(videos) && videos.map((video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden relative mb-3">
                  <img
                  src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                  /> 
                </div>
            {/*情報 */}
              <h4 className="font-bold text-lg">{video.title}</h4>
              <p className="text-gray-500">{video.artist_name} ({video.instrument})</p>
            </div>
            ))}
          </div>
        </section>
        
      </main>
    </div>  
  );
}