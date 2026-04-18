"use client";

import React, { useState, useEffect, useRef ,useMemo} from 'react';


//URLからYouTube IDを抽出する関数
const extractYoutubeId = (url: string) => {
  if (!url) return null;

  // 1. まずは一般的なYouTube URLのパターンを試す
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const matches = url.match(regex);
  
  if (matches && matches[1]) {
    return matches[1];
  }

  // 2. パターンに漏れた場合でも、11桁のIDが直接入力されている可能性を考慮
  // (IDは英数字、ハイフン、アンダースコアの組み合わせ)
  if (url.length === 11) {
    return url;
  }

  return null;
};

export default function Home(){
  const [searchWord, setSearchWord] = useState("");
  const [videos ,setVideos] = useState<any[]>([]);
  const [selectedInstrument,setSelectedInstrument] = useState("all");
  const [newVideo, setNewVideo] = useState({
    youtube_id: "",
    title:"",
    artist_name: "",
    instrument: "Guitar"
  });
  const [sortType, setSortType] =useState('newest');
  const [displayCount, setDisplayCount] =useState(10);

  //並び替え
  const processedVideos = useMemo(()=>{
    if(!Array.isArray(videos)) return [];

    const result = [...videos];

    result.sort((a,b)=>{
      if(sortType === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if(sortType === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if(sortType === 'title') return a.title.localeCompare(b.title, 'ja');
      if(sortType === 'artist') return a.artist_name.localeCompare(b.artist_name, 'ja');
      return 0;
    });
    return result;
  },[videos, sortType]);

  const visibleVideos =processedVideos.slice(0,displayCount);

  const homeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  //スクロール関数
  const scrollTo =(ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth'});
  };
  const handleSubmit = async (e: React.FormEvent) =>{
    console.log("新規登録を開始します")
    e.preventDefault();

    console.log("入力されたURL:", newVideo.youtube_id);
    const videoId = extractYoutubeId(newVideo.youtube_id);
    console.log("抽出されたID:", videoId); // ここが null だと弾かれます

    if (!videoId) {
      alert(`YouTube IDを抽出できませんでした。\n入力: ${newVideo.youtube_id}`);
      return;
    }

    const submitData = {
      ...newVideo,
      youtube_id: videoId //youtube_idに上書き
    };

    try {
      const response = await fetch('http://localhost:5000/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      
    });

    if(response.ok){
      alert("登録完了");
      setNewVideo({ youtube_id: "", title: "", artist_name: "", instrument: "Guitar" });
      //登録後再読み込み
      const res = await fetch('http://localhost:5000/api/videos');
      const data = await res.json();
      setVideos(data);
    }
  }catch(error){
      console.error("登録失敗",error);
    }
  }

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
    <div className="min-h-screen bg-[#fcfcfc] text-gray-900 front-sans">
      <header ref={homeRef} className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          {/*ロゴ画像 */}
          <img
            src="/logo.png"
            alt="TABTube Logo"
            width={150}
            height={40}
            className="h-19 w-auto object-contain mr-10"
          />
          {/*ヘッダーボタン */}
          <nav className="flex flex-1 gap-4 text-[15px] font-medium text-gray-600">
            <button onClick={() => scrollTo(homeRef)} className="hover:text-pink-600 transition cursor-pointer">ホーム</button>
            <button onClick={() => {setSortType('newest'); scrollTo(listRef)}} className="hover:text-pink-600 transition cursor-pointer">新着動画</button>
            <button onClick={() => scrollTo(formRef)} className="hover:text-pink-600 transition cursor-pointer">新規登録</button>
          </nav>
          <button className="text-[15px] bg-pink-300 text-white px-2 py-2.5 rounded-lg font-bold hover:bg-purple-500 transition">ログイン</button>
        </div>
      </header>
      <main className="mb-16">
        {/* 検索セクション */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="relative group flex items-center">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg
                className ="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder ="曲名/アーティスト名を入力..."
            className="w-full bg-[#f7f8f9] border border-transparent rounded-full py-4 pl-14 pr-6 text-lg outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-pink-500 transition-all placeholder-gray-400 text-gray-700"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch('title')}
            />
            <div className="absolute right-2 flex gap-1">
            <button
            onClick={()=>handleSearch('title')}
            className="bg-pink-300 text-white px-2 py-2.5 rounded-lg font-bold hover:bg-purple-500 transition">曲名で検索</button>
            <button
            onClick={()=>handleSearch('artist')}
            className="bg-pink-300 text-white px-2 py-2.5 rounded-lg font-bold hover:bg-purple-500 transition"
            >
              アーティスト名で検索
            </button>
            </div>
            
          </div>
        </div>
          <div className ="mt-6 flex gap-8 justify-center">
            {[
              { id:'all', label: 'すべて'},
              { id:'Guitar', label: 'ギター'},
              { id:'Bass', label: 'ベース'}
            ].map((item)=>(
              <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="instrument"
                  className="w-4 h-4 accent-pink-600 cursor-pointer"
                  checked={selectedInstrument ==item.id}
                  onChange={()=>setSelectedInstrument(item.id)}
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-pink-600">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </section>
        {/*動画一覧 */}
        <section className="mb-20">

          <div ref={listRef} className="flex items-end justify-between mb-8">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-1.5 h-7 bg-purple-600 rounded-full"></span>
              TAB譜 一覧
            </h3>
            {/*並び替え*/}
            <div>
              <span>並び替え:</span>
              <select
                value={sortType}
                onChange={(e)=>setSortType(e.target.value)}
              >
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                <option value="title">曲名順</option>
                <option value="artist">アーティスト順</option>
              </select>
            </div>
          </div>
          {/*動画 */}
          <div className="grid gap-4"> 
            {visibleVideos.map((video) => (
              <div 
                key={video.id}
                className="flex gap-4 p-4 bg-white hover:bg-purple-50/30 rounded-2xl transition-all border border-gray-800 hover:border-pink-100 hover:shadow-md cursor-pointer group">
                <div className="relative w-48 h-28 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
                  <a href={`https://youtu.be/${video.youtube_id}`} target="_blank" rel="noopener noreferrer">
                    <img
                    src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  </a>
                   
                </div>
            {/*情報 */}
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{video.title}</h3>
              <p className="text-gray-500">{video.artist_name} </p>
              <p className="inline-block bg-pink-500 text-white px-1 py-1.5 rounded-lg font-bold text-center">{video.instrument}</p>
            </div>
              
              
              
            </div>
            ))}
            {processedVideos.length > displayCount && (
              <div className="mt-10 text-center">
                <button
                  onClick={() =>setDisplayCount(prev => prev +10)}
                  className="px-8 py-3 border border-purple-200 text-pink-600 rounded-full font-bold hover:bg-purple-50 transition"
                >
                  表示数を増やす(残り{processedVideos.length - displayCount} 件)
                </button>
              </div>
            )}
          </div>

        </section>
        {/*新規登録フォームセクション*/}
        <section>
          <h2>新規TAB譜を掲載</h2>
          <form onSubmit={handleSubmit} >
            <input
              type="text"
              placeholder="YouTube URL または 動画ID"
              value={newVideo.youtube_id}
              onChange={(e) => setNewVideo({...newVideo, youtube_id: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="曲名"
              value={newVideo.title}
              onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="アーティスト名"
              value={newVideo.artist_name}
              onChange={(e) => setNewVideo({...newVideo, artist_name: e.target.value})}
              required
            />
            <select
            value ={newVideo.instrument}
            onChange={(e) => setNewVideo({...newVideo, instrument: e.target.value})}
            >
              <option value="Guitar">ギター</option>
              <option value="Bass">ベース</option>
              
            </select>
            <button type="submit">
              登録
            </button>
          </form>
        </section>
      </main>
    </div>  
  );
}