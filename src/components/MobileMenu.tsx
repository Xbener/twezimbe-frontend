import Cookies from "js-cookie";
import Link from "next/link";

type Props = {
    handleClose: () => void
}

const MobileMenu = ({ handleClose }: Props) => {
    return (
        <>
            {/* Mobile Menu  */}
            <div className="lg:hidden container absolute left-0 top-16 z-50 text-center w-full bg-blue-500 text-white rounded-md">
                <span className="flex flex-col py-10">
                    <a href={'/'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border w-1/2 place-self-center mb-1">Home</a>
                    <a href={'#process'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border w-1/2 place-self-center mb-1">Process</a>
                    <a href={'#benefits'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border w-1/2 place-self-center mb-1">Benefits</a>
                    <Link href={'/apply'} onClick={handleClose} className=" text-white hover:bg-neutral-50 p-3 hover:text-blue-500 border w-1/2 place-self-center mb-1">Get Started</Link>

                    {Cookies.get('access-token')
                        ?
                        <>
                            <a href={'/account'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border w-1/2 place-self-center mb-1">Profile</a>
                            <a href={'/groups'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border w-1/2 place-self-center mb-1">Groups </a>
                            <a href={'/account/applications'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border w-1/2 place-self-center mb-1">Applications</a>
                        </>
                        :
                        <Link href={'/SignIn'} onClick={handleClose} className="text-white p-2  border-white py-2 hover:bg-blue-50 hover:text-blue-500 border w-1/2 place-self-center mb-10 focus:bg-blue-500">Sign In</Link>
                    }
                </span>
            </div>
        </>
    )
}

export default MobileMenu