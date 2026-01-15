import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#edf0f79e] w-full py-5">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-16 lg:px-20 py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 ">
                <div className="flex flex-col gap-3">
                    <h6 className="text-gray-600 text-sm">Product</h6>
                    <ul className="pl-1">
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 1</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 2</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 3</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 4</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 5</Link></li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <h6 className="text-gray-600 text-sm">Company</h6>
                    <ul className="pl-1">
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 1</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 2</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 3</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 4</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 5</Link></li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <h6 className="text-gray-600 text-sm">Resources</h6>
                    <ul className="pl-1">
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 1</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 2</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 3</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 4</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 5</Link></li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <h6 className="text-gray-600 text-sm">Social</h6>
                    <ul className="pl-1">
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 1</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 2</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 3</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 4</Link></li>
                        <li className="text-gray-800 font-medium"><Link href={"#"}>Option 5</Link></li>
                    </ul>
                </div>

                <div className="flex flex-col gap-4">
                    <h6 className="text-gray-600 text-sm">Get the App</h6>
                    <ul>
                        <li className="py-2"><Image alt="Appstore link" src={"/images/appstore.png"} width={150} height={50} /></li>
                        <li className="py-2"><Image alt="playstore link" src={"/images/playstore.png"} width={150} height={50} /></li>
                    </ul>
                </div>
            </div>

            <div className="flex justify-between items-center px-4">
                <Link href="/" className="flex items-center">
                    <span className="ml-2 text-xl font-bold text-gray-900">DigiStore</span>
                </Link>
                <p className="text-sm text-gray-400">© 2024 Digistore. All rights reserved.</p>
            </div>
        </footer>
    )
}