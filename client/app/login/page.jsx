import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClientComponentClient()

    //会員登録機能
    const handleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({email,password,options: { emailRedirectTo: `${window.location.origin}/auth/callback` },})
        if(error) alert(error.message)
        else alert('確認メールを送信しました')
        setLoading(false)
    }

    //ログイン機能
    const handleSignIn = async () =>{
        setLoading(true)
        const {error} = await supabase.auth.signInWithPassword({ email, password})
        if(error) alert(error.message)
        else{
            router.push('/')
            router.refresh()
        }      
        setLoading(false)
    }

    return(
        <div>
            <h1>ログイン/会員登録</h1>
            <input
                type="email"
                placeholder="メールアドレス"
                className="p-4 bg-gray-50 rounded-2xl outline-none border focus:border-purple-400"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="パスワード"
                className="p-4 bg-gray-50 rounded-2xl outline-none border focus:border-purple-400"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                onClick={handleSignIn}
                disabled={loading}
                className="bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-purple-600 transition"
            >{loading ? '処理中...' :'ログイン'}</button>
            <button
                onClick={handleSignUp}
                className="bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-purple-600 transition"
            >新規登録</button>
        </div>
    )
}