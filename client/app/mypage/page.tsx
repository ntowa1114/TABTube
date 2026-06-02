'use client'
import { useAuth }from '@/components/AuthProvider'

export default function MyPage(){
    const {user, loading, signOut } = useAuth()

    if(loading) return <p className="p-8">読み込み中...</p>
    if(!user) return <p className="p-8">ログインしてください</p>

    return (
        <main>
            <h1>マイページ</h1>
            <p>{user.email}</p>
            <button
                onClick={signOut}
            >ログアウト</button>
        </main>
    )
}