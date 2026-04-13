export default function Home(){
  const dummyVideos =[
    {id : '1', title:'Hi-STANDARD-STAY GOLD(Guitar TAB)',channel:'Tab TV'},
    {id : '2', title:'Hi-STANDARD-STAY GOLD(Guitar TAB)SHANK - Set the fire (Bass TAB)',channel:'Tabくん'}
  ];
  return(
    <main>
      <h1>TAB Tube</h1>
      {/* 検索窓 */}
      <div>
        <input
          type="text"
          placeholder ="曲名/アーティスト名を入力"
        />
        <button>曲名検索</button>
        <button>アーティスト名検索</button>
      </div>
      {/* 動画一覧 */}
      <div>
      

      </div>
    </main>
  )
}