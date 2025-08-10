import Prism from 'prismjs';
import { useEffect } from 'react';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import "./code-theme.css"



interface Props {
    code: string;
    lang: string;
}

export const CodeView = ({ code, lang }: Props) => {
    useEffect(() => {
        Prism.highlightAll();
    }, []);

    return (
        <pre
            className='p-3 bg-[#161719] border border-[rgba(255,255,255,0.06)] rounded-lg m-0 text-xs shadow-lg'
        >
            <code
                className={`language-${lang}`}
            >
                {code}
            </code>

        </pre>
    )
}