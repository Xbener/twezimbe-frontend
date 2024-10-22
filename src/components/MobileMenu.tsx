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
                    <a href={'/'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border-b border-white">Home</a>
                    <a href={'#process'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border-b border-white">Process</a>
                    <a href={'#benefits'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border-b border-white">Benefits</a>
                    <Link href={'/apply'} onClick={handleClose} className=" text-white border border-b hover:bg-neutral-50 p-3 hover:text-blue-500">Get Started</Link>

                    {Cookies.get('access-token')
                        ?
                        <>
                            <a href={'/account'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border-b border-white">Profile</a>
                            <a href={'/account/applications'} onClick={handleClose} className="text-white p-2 hover:bg-blue-50 hover:text-blue-500 border-b border-white">Applications</a>
                        </>
                        :
                        <Link href={'/signin'} onClick={handleClose} className="text-white p-2  border-white py-2 hover:bg-blue-50 hover:text-blue-500 border-b border-white0 focus:bg-blue-500">Sign In</Link>
                    }
                </span>
            </div>
        </>
    )
}

export default MobileMenu