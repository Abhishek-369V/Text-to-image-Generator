import { useState } from 'react'                // axios.post syntax is there in readme.md
import axios from 'axios'                       // axios: Promise-based HTTP client for making API requests (better than fetch in many cases).

export default function ImageGenerator() {

    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState(null)
    const [error, seterror] = useState(null)


    const OnChangeHandler = (e) => {
        setInput(e.target.value)
    }



    const OnSubmitHandler = async (e) => {
        e.preventDefault()                //sending data via an API request without a full page refresh.     i.e., preventing the default behavior of a form submission, which typically causes a page reload
        seterror(null)
        setLoading(true)
        setImageUrl(null)                 //Clears old image so the new one replaces it.
    
    // const HF_KEY = import.meta.env.VITE_HF_API_KEY
    console.log("KEY:", import.meta.env.VITE_HF_API_KEY);

        if (!input.trim()) {
            seterror("Please enter some prompt")
            setLoading(false)
            return
        }

        // Coding practise: always render await.fetch or await.axios in try,catch!
        try {
            const response = await axios.post("https://router.huggingface.co/nscale/v1/images/generations", {
                model: "stabilityai/stable-diffusion-xl-base-1.0",
                prompt: input,
                parameters: {
                    width: 512,
                    height: 512
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
                    'Content-Type': 'application/json'                    // It tells the server, “Hey, I’m sending data in JSON format”.
                },
            })
            if (response.data?.data?.[0]?.b64_json) {                 // optional chaining (..details in readme.md)    
                const image = `data:image/png;base64,${response.data.data[0].b64_json}`        //This is a data URL format. It tells the browser that what follows is raw PNG image data in Base64 form, so it can display it directly without saving to a file or fetching from a URL.
                setImageUrl(image)
            }
            else {
                seterror("No image found...Try another prompt!")
            }

        } catch (error) {
            console.log(error);
            seterror("Something went wrong!...check console for error")
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <>
            <form onSubmit={OnSubmitHandler} className='container flex justify-center mt-15 gap-2 px-6 md:gap-3'>
                <input name='input' value={input} onChange={OnChangeHandler} type="text" className='text-xs bg-[#242121] text-white p-2 h-9 rounded-md w-[85%] outline-none border-none ring-2 ring-black md:text-lg md:h-12 md:p-3 md:w-1/2' placeholder='Describe what you would like to generate...?' />
                <button disabled={loading} className={`btn p-2 h-9 text-xs flex items-center rounded-md outline-none border-none ring-2 ring-black cursor-pointer md:text-lg md:h-12 md:p-3  ${loading ? "bg-gray-600 cursor-not-allowed" : " bg-[#242121] text-white hover:bg-[#1a1a1a]"}`}>

                    {loading ? "Generating..." : "Generate" }</button>
            </form>

            <div className="loadImage flex flex-col items-center font-bold text-lg m-5">
                {error && <p className='error text-xs text-red-700 md:text-lg'>{error}</p>}
                {loading && !error && <p className=' text-xs load text-white md:text-lg'>Loading...</p>}       {/*  ===> If loading and no error yet, show "Loading...". */}
                {imageUrl && <img src={imageUrl} alt={"Couldn't get image"} className='rounded-md shadow-2xl border-4 border-black max-w-sm md:max-w-lg' ></img>}
                {imageUrl && <a href={imageUrl} download={"generated_image.png"} className='mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700' >Download</a>}
            </div>

        </>
    )
}



