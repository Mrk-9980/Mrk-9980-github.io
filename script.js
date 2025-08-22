// گرفتن لیست فایل‌ها از فایل JSON
async function loadFileList(){
    const res = await fetch(FILES_DIR + "files.json");
    return await res.json();
}

async function populateFileSelect(){
    const files = await loadFileList();
    const select = document.getElementById("fileSelect");
    files.forEach(f=>{
        let opt = document.createElement("option");
        opt.value = f;
        opt.textContent = f;
        select.appendChild(opt);
    });
}

function isFarsi(text){
    return /[\u0600-\u06FF]/.test(text);
}

async function loadFile(fileName){
    const res = await fetch(FILES_DIR + fileName);
    const text = await res.text();
    return text.split(/\r?\n/).filter(l => l.trim() !== '');
}

document.getElementById("showBtn").addEventListener("click", async () => {
    const selectedFiles = Array.from(document.getElementById("fileSelect").selectedOptions).map(o=>o.value);
    if(selectedFiles.length === 0){ alert("لطفا یک فایل انتخاب کنید."); return; }

    let allLines = [];
    for(const f of selectedFiles){
        const lines = await loadFile(f);
        allLines = allLines.concat(lines);
    }

    const num = parseInt(document.getElementById("numLines").value);
    const mode = document.querySelector('input[name="mode"]:checked').value;
    let start = parseInt(document.getElementById("fromLine").value) || 1;
    let end = parseInt(document.getElementById("toLine").value) || allLines.length;

    if(start < 1) start = 1;
    if(end > allLines.length) end = allLines.length;
    if(start > end){ alert("بازه نامعتبر است."); return; }

    let subset = allLines.slice(start-1, end);

    if(num > subset.length){ alert("تعداد بیشتر از خطوط در بازه است."); return; }

    let selected = [];
    if(mode === "order"){
        selected = subset.slice(0, num);
    } else {
        let copy = [...subset];
        for(let i=0;i<num;i++){
            const idx = Math.floor(Math.random()*copy.length);
            selected.push(copy[idx]);
            copy.splice(idx,1);
        }
    }

    // نمایش نتایج
    const output = document.getElementById("output");
    output.innerHTML = "";
    selected.forEach((line,i)=>{
        const li = document.createElement("li");
        li.className = isFarsi(line)? "rtl":"ltr";
        li.innerHTML = isFarsi(line)? `<span class="number">${i+1}.</span> ${line}`: line;
        output.appendChild(li);
    });

    document.getElementById("formPage").classList.add("hidden");
    document.getElementById("resultPage").classList.remove("hidden");
});

// دکمه بازگشت
document.getElementById("backBtn").addEventListener("click", ()=>{
    document.getElementById("resultPage").classList.add("hidden");
    document.getElementById("formPage").classList.remove("hidden");
});

// وقتی صفحه لود شد فایل‌ها رو توی لیست بذاره
populateFileSelect();
