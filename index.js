const API_KEY = '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';
const API_URL = 'https://api.openai.com/v1/chat/completions'

const promptInput = document.getElementById("promptInput")
const generateBtn = document.getElementById("generateBtn")
const stopBtn = document.getElementById("stopBtn")
const resultText = document.getElementById("resultText")

// AbortController instance
let controller = null;

const generate =async ()=> {
  if (!promptInput.value) {
    // resultText.innerText ="Please enter a prompt.";
    alert("프롬프트를 입력하세요.")
    return;
  }

  generateBtn.disabled = true;
  resultText.innerText= "Generating ...";
  // generateBtn.innerText= "Generating";
  stopBtn.disabled = false;

  controller = new AbortController();
  const signal = controller.signal;
  try {
    const response = await fetch(API_URL, {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model:"gpt-3.5-turbo",
        messages: [{role: "user", content:promptInput.value}],
        stream: true,
      }),
      // signal:signal, 
      signal,
    })

    // stream: true,설정 이후

    //const data = await response.json()
    //resultText.innerText = data.choices[0].message.content
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8")
    resultText.innerText =""

    while (true) {
      const chunk = await reader.read();
      const {done, value} = chunk;
      if (done) {
        break;
      }
      const decodedChunk = decoder.decode(value)
      const lines = decodedChunk.split("\n");
      const parsedLines = lines.map((line) =>line.replace(/^data: /,"").trim())
                               .filter(line=>line !=="" && line !=="[DONE]")
                               .map(line => JSON.parse(line))

      for (const parsedLine of parsedLines) {
        const { choices } = parsedLine;
        const {delta} = choices[0];
        const {content} = delta;
        if (content) {
          // console.log(content)
          resultText.innerText += content;
        }
      }
      
    }

  } catch (error) {
    if(signal.aborted){
      resultText.innerText = "취소요청 되었습니다.( Request aborted )"
    } else {
      resultText.innerText= "Error occurred while generating.";
      console.error("Error :", error)
    }
   
  } finally {
    generateBtn.disabled = false;
    // generateBtn.innerText= "Generate";
    stopBtn.disabled = true;
    controller = null;
  }
}
const stop = ()=>{
  if (controller) {
    controller.abort();
    controller = null;
  }
}

generateBtn.addEventListener("click", generate);
promptInput.addEventListener("keyup", (event)=> {
  if (event.key === "Enter"){
    generate()
  }
})
stopBtn.addEventListener("click",stop)