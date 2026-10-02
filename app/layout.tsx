import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'RemAvi | Remote Aviation. Real Data.',description:'Commercial drone inspection, thermal imaging, mapping and site documentation in Corpus Christi and the Coastal Bend.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
