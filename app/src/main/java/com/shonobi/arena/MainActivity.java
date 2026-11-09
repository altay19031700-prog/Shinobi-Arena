package com.shonobi.arena;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.content.res.AssetManager;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private WebView webView;
    private ServerSocket server;
    private ExecutorService pool = Executors.newFixedThreadPool(4);
    private volatile boolean running = true;
    private final Handler main = new Handler(Looper.getMainLooper());

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());
        new Thread(() -> {
            try {
                server = new ServerSocket(0, 16, java.net.InetAddress.getByName("127.0.0.1"));
                int port = server.getLocalPort();
                main.post(() -> webView.loadUrl("http://127.0.0.1:" + port + "/index.html"));
                while (running) {
                    try { Socket socket = server.accept(); pool.execute(() -> serve(socket)); }
                    catch (Exception e) { if (running) android.util.Log.e("Shinobi", "Accept", e); }
                }
            } catch (Exception ex) {android.util.Log.e("Shinobi", "Server startup", ex);}
        }, "Shinobi-LocalServer").start();
    }

    private static String mime(String path) {
        String p=path.toLowerCase(Locale.ROOT);
        if(p.endsWith(".js"))return "application/javascript; charset=utf-8";
        if(p.endsWith(".html"))return "text/html; charset=utf-8";
        if(p.endsWith(".css"))return "text/css; charset=utf-8";
        if(p.endsWith(".json")||p.endsWith(".webmanifest"))return "application/json; charset=utf-8";
        if(p.endsWith(".wav"))return "audio/wav";
        if(p.endsWith(".webp"))return "image/webp";
        if(p.endsWith(".png"))return "image/png";
        if(p.endsWith(".jpg")||p.endsWith(".jpeg"))return "image/jpeg";
        if(p.endsWith(".svg"))return "image/svg+xml";
        if(p.endsWith(".woff2"))return "font/woff2";
        return "application/octet-stream";
    }
    private void serve(Socket socket) {
        try(Socket client=socket) {
            client.setSoTimeout(5000);
            InputStream input = new BufferedInputStream(client.getInputStream());
            OutputStream output = new BufferedOutputStream(client.getOutputStream());
            java.io.ByteArrayOutputStream line = new java.io.ByteArrayOutputStream();
            int b;
            while((b=input.read())!=-1 && b!='\n' && line.size()<8192){if(b!='\r')line.write(b);}
            String req=line.toString("UTF-8");
            String[] parts=req.split(" ");
            if(parts.length<2 || !(parts[0].equals("GET")||parts[0].equals("HEAD"))){sendError(output,405);return;}
            String raw=parts[1].split("\\?")[0];
            String path=URLDecoder.decode(raw,"UTF-8");
            if(path.equals("/"))path="/index.html";
            if(!path.startsWith("/")||path.contains("..")||path.contains("\\")){sendError(output,403);return;}
            path=path.substring(1);
            try(InputStream resource=getAssets().open(path,AssetManager.ACCESS_STREAMING)) {
                byte[] bytes=readAll(resource);
                String header="HTTP/1.1 200 OK\r\nContent-Type: "+mime(path)+"\r\nContent-Length: "+bytes.length+"\r\nCache-Control: public, max-age=3600\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n";
                output.write(header.getBytes(StandardCharsets.US_ASCII));
                if(parts[0].equals("GET"))output.write(bytes);
                output.flush();
            } catch (java.io.FileNotFoundException ex) {sendError(output,404);}
        } catch(Exception ex) {android.util.Log.w("Shinobi", "Asset request", ex);}
    }
    private byte[] readAll(InputStream in)throws java.io.IOException {
        java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();
        byte[] buf=new byte[16384];int n;
        while((n=in.read(buf))!=-1)out.write(buf,0,n);
        return out.toByteArray();
    }
    private void sendError(OutputStream out,int code)throws java.io.IOException {
        byte[] body=("Error "+code).getBytes(StandardCharsets.UTF_8);
        out.write(("HTTP/1.1 "+code+" Error\r\nContent-Length: "+body.length+"\r\nConnection: close\r\n\r\n").getBytes(StandardCharsets.US_ASCII));
        out.write(body);out.flush();
    }
    @Override public void onBackPressed() {
        if(webView.canGoBack())webView.goBack();else super.onBackPressed();
    }
    @Override protected void onDestroy(){
        running=false;
        try{if(server!=null)server.close();}catch(Exception ignored){}
        pool.shutdownNow();
        if(webView!=null){webView.destroy();webView=null;}
        super.onDestroy();
    }
}
