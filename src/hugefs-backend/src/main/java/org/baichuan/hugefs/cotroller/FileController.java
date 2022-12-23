package org.baichuan.hugefs.cotroller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.baichuan.hugefs.domin.LoginVo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Slf4j
@Controller
@RequestMapping("/")
public class FileController {
    public static Map<Integer,String> map=new HashMap<>();
    public static  ByteArrayOutputStream output = new ByteArrayOutputStream();
    public static File file;
    public static int pre;
    public static int end;
    @RequestMapping("file")
    @ResponseBody
    public static String file(HttpServletResponse response, HttpServletRequest request, @RequestBody JSONObject loginVo) throws IOException {
        log.info(loginVo.getString("seq"));
        switch (loginVo.getString("process")) {
            case "start": {
                //1 新建文件 有则删除
                pre=-1;
                String path = "/www/app/huge-backend/resource/"
                        + loginVo.getString("filename");
                file = new File(path);
                if (file.exists()) {
                    file.delete();
                }
                if (!file.getParentFile().exists()) {
                    boolean mkdir = file.getParentFile().mkdirs();
                    if (!mkdir) {
                        throw new RuntimeException("创建目标文件所在目录失败！");
                    }
                }
                file.createNewFile();
                break;
            }
            case "running": {
                //1 比对pre 是则替换pre并写入文件
                //         否则加入map 并在map里寻找 有则替换pre并写入文件
                //                                否则结束
                String str = loginVo.getString("frame");
                if(Integer.valueOf(loginVo.getString("seq"))==pre+1){
                    log.info(pre+1+"写入 中");
                    if(str!=null){
                        char[] chars = str.toCharArray();
                        for (char cur : chars) {
                            byte b = (byte) (int) cur;
                            output.write(b);
                        }
                    }
                    pre++;
                    while(map.containsKey(pre+1)){
                        log.info(pre+1+"写入 while");
                        String str0=map.get(pre+1);
                        map.remove(pre+1);
                        if(str0!=null){
                            char[] chars = str0.toCharArray();
                            for (char cur : chars) {
                                byte b = (byte) (int) cur;
                                output.write(b);
                            }
                        }
                        pre++;
                    }
                }else{
                    map.put(Integer.valueOf(loginVo.getString("seq")),str);
                }
                if (pre % 5 == 0||pre+1==end) {
                    writeFile();
                }
                break;
            }
            case "finish": {
                //3 全部写入文件
                end=Integer.valueOf(loginVo.getString("seq"));
                break;
            }
            default:
                return null;
        }
        return null;
    }

    private static void writeFile() {
        byte[] out=output.toByteArray();
        output.reset();
        try {
            // 创建基于文件的输出流
            FileOutputStream fos = new FileOutputStream(file,true);
            // 把数据写入到输出流
            fos.write(out);
            // 关闭输出流
            fos.flush();
            fos.close();

        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}
