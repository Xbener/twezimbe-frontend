import { User } from "@/types"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { socket } from "@/context/MyContext"
import { io, Socket } from "socket.io-client"
const handlecreateDirectMessage = async (user: User, currentUser: User, router: AppRouterInstance, setRoomId: (vl: any) => void) => {
    try {
        let newSocket: Socket = socket
        if (!socket.connected) {
            newSocket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}`);
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('access-token')}`,
            },
            body: JSON.stringify({ name: `${user?.lastName}-${currentUser?.firstName}'s room`, members: [`${user.id || user?._id || user?.userId}`, `${currentUser?._id}`], type: 'dm' }),
        })

        const data = await res.json()
        if (!data.status) return toast.error(data.errors || data.messaga || "failed")
        newSocket?.emit('dm', { dm: data.chatroom })
        router.push(`/groups/direct/${data.chatroom?._id}`)
    } catch (error) {
        toast.error('failed')
        console.log(error)
    }
}


export default handlecreateDirectMessage