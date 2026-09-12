const fs=require("fs"),path=require("path");
const dir=path.join(__dirname,"../public/cdi");
const files=fs.readdirSync(dir).filter(f=>f.endsWith(".html"));
let cnt=0;
for(const file of files){
  const full=path.join(dir,file);
  let html=fs.readFileSync(full,"utf-8");
  if(html.includes("/* Beautiful Enhancement - IELTS Master */")) continue;
  // inject beautiful enhancement CSS after </style> or before </head>
  const beautifyCSS=`
  /* Beautiful Enhancement - IELTS Master */
  header{backdrop-filter:blur(16px) !important; box-shadow:0 4px 24px rgba(15,23,42,.08) !important; border-bottom:1px solid #e2e8f0 !important}
  #panel-p, #panel-q{border-radius:20px !important; box-shadow:0 12px 40px rgba(15,23,42,.08) !important; border:1px solid #e2e8f0 !important; overflow:hidden}
  #instruction-bar{border-radius:16px !important; margin:12px !important; box-shadow:0 4px 16px rgba(0,0,0,.04) !important; border:1px solid #e2e8f0 !important}
  .q-dropdown-row, .answer-input{border-radius:10px !important}
`;
  if(html.includes("</style>")){
    html=html.replace("</style>", beautifyCSS+"\n</style>");
    fs.writeFileSync(full,html,"utf-8");
    cnt++;
  }
}
console.log(`✅ Beautified ${cnt} CDI HTML files (all skills)`);
