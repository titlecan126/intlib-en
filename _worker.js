export default {
  async fetch(request, env) {
      // 解析请求的URL
      const url = new URL(request.url);
      const originalHost = url.hostname; // 保存原始主机名
      const path = url.pathname + url.search; // 获取请求的路径和查询字符串

      // 判断路径是否以"/books-files/"开头
      if (!path.startsWith("/books-files/")) {
          // 如果不符合条件，修改主机名为'z-lib.fm'
          url.hostname = 'z-lib.fm';
      }

      // 向修改后的URL发送请求
      let response = await fetch(url, request);
      let locationHeader = response.headers.get('Location'); // 获取Location头部信息

      // 如果Location头部存在
      if (locationHeader) {
          const locationUrl = new URL(locationHeader); // 创建新的URL对象
          // 判断新的URL路径是否以"/books-files/"开头
          if (!locationUrl.pathname.startsWith("/books-files/")) {
              // 如果不符合条件，恢复原始主机名
              locationUrl.hostname = originalHost;
          }

          // 创建一个新的响应对象，并更新Location头部
          response = new Response(response.body, response);
          response.headers.set('Location', locationUrl.toString());
      }

      // 处理Set-Cookie头部
      let cookieHeaders = response.headers.get('Set-Cookie');
      if (cookieHeaders) {
          // 分割Cookie字符串并去除空格
          let cookies = cookieHeaders.split(',').map(cookie => cookie.trim());
          response = new Response(response.body, response); // 创建新的响应
          response.headers.delete('Set-Cookie'); // 删除原有的Set-Cookie头部

          // 修改每个Cookie的domain属性
          cookies.forEach(cookie => {
              let updatedCookie = cookie.replace(/(domain=)([^;]+)(;|$)/gi, `$1${originalHost}$3`);
              response.headers.append('Set-Cookie', updatedCookie); // 添加更新后的Cookie
          });
      }

      // 返回最终的响应对象
      return response;
  }
}
