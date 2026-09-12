const fs=require('fs'), path=require('path');
const dir=path.join(__dirname,'../public/cdi');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
let removed=0;
for(const file of files){
  if(file.includes('reading')) continue; // keep only reading
  const full=path.join(dir,file);
  let html=fs.readFileSync(full,'utf-8');
  if(!html.includes('small-music-player')) continue;
  // Remove the widget block: from <!-- Small Material Player --> to </script> after it
  // Our widget starts with <!-- Small Material Player and ends with </script> after audio
  const start = html.indexOf('<!-- Small Material Player');
  const endMarker = '</script>';
  // Find the end of the injected script (the one after small player)
  // We injected one <style> + <div> + <audio> + <script>
  // Find from start to the next </script> after start + then include that
  let end = -1;
  if(start !== -1){
    // find the closing </script> of our injected script (the one with fetch('/api/music'))
    let searchFrom = start;
    // find the second </script> after start? Actually our injection has one <style>, then HTML, then <script> ... </script>
    // So find the first </script> after start that is our injected one (contains small-music-player)
    const firstScriptEnd = html.indexOf('</script>', start + 100);
    const secondScriptEnd = html.indexOf('</script>', firstScriptEnd + 10);
    // Our widget's script ends at the second </script> after start? Let's just find the audio script end
    // Simpler: find the marker after our widget: look for "</script>" after the injected block and take it
    // Our injected widget ends with "</script>" then we have original content
    // So find the </script> that is closest after start and contains "small-music-player" logic
    // We'll search for the string after our widget: look for "small-music-player" and then find next </script>
    let idx = html.indexOf('small-music-player', start);
    let scriptStart = html.indexOf('<script>', idx);
    let scriptEnd = html.indexOf('</script>', scriptStart);
    if(scriptEnd !== -1){
      end = scriptEnd + '</script>'.length;
      // Remove from start (which includes <!-- Small Material Player) to end
      // Need to find start of the comment
      const widgetStart = html.lastIndexOf('<!-- Small Material Player', idx);
      const before = html.slice(0, widgetStart);
      const after = html.slice(end);
      html = before + after;
      fs.writeFileSync(full, html, 'utf-8');
      removed++;
    }
  }
}
console.log(`✅ Removed small player from ${removed} non-reading files (kept 75 reading)`);
