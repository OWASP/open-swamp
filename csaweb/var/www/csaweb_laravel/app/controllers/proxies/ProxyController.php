<?php

namespace Controllers\Proxies;

use PDO;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Models\Viewers\ViewerInstance;
use Models\Users\User;
use Controllers\BaseController;

class ProxyController extends BaseController {

	public function proxyCodeDxRequest(){
		$user = User::getIndex(Session::get('user_uid'));

		// check viewer
		//
		$viewerInstance = ViewerInstance::where('proxy_url','=',Request::segment(1))->first();
		if ($viewerInstance) {

			// get virtual machine info
			//
			$vm_ip = $viewerInstance->vm_ip_address;
			$content = Request::instance()->getContent();
			$tfh = tmpfile();
			fwrite($tfh, $content);
			$uri = stream_get_meta_data( $tfh )['uri'];
			$url = "https://$vm_ip".$_SERVER['REQUEST_URI'];
			$req = "curl -X $_SERVER[REQUEST_METHOD] '$url' "; 
			if (isset( $_COOKIE['JSESSIONID'])) {
				$req .= " -H 'Cookie: JSESSIONID=$_COOKIE[JSESSIONID]' "; 
			}
			$req .= " -H 'Host: $vm_ip' "; 

			foreach( getallheaders() as $key => $value ){
				if( strtolower( $key ) == 'origin' )
					$req .= " -H " . escapeshellarg("Origin: $value"); 
				if( strtolower( $key ) == 'accept-encoding' )
					$req .= " -H " . escapeshellarg("Accept-Encoding: $value");
				if( strtolower( $key ) == 'accept-language' )
					$req .= " -H " . escapeshellarg("Accept-Language: $value"); 
				if( strtolower( $key ) == 'content-type' )
					$req .= " -H " . escapeshellarg("Content-Type: $value");
				if( strtolower( $key ) == 'accept' )
					$req .= " -H " . escapeshellarg("Accept: $value");
				if( strtolower( $key ) == 'cache-control' )
					$req .= " -H " . escapeshellarg("Cache-Control: $value");
				if( strtolower( $key ) == 'x-requested-with' )
					$req .= " -H " . escapeshellarg("X-Requested-With: $value");
				if( strtolower( $key ) == 'connection' )
					$req .= " -H " . escapeshellarg("Connection: $value");
				if( strtolower( $key ) == 'referer' )
					$req .= " -H " . escapeshellarg("Referer: $value");
			}

			$req .= " -H 'AUTHORIZATION: SWAMP ".strtolower( $user->username )."' ";
			$req .= " -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36' ";

			$req .= " --data-binary @$uri ";
			$req .= " --compressed --insecure -i";
			
			$response = `$req`;

			fclose($tfh);

			function get_headers_from_curl_response($headerContent){
				$headers = array();

				// split the string on every "double" new line.
				//
				foreach (explode("\r\n", $headerContent) as $i => $line){
					if ($i === 0)
						$headers['http_code'] = $line;
					else{
						if( strpos($line, ': ' ) !== false ){
							list ($key, $value) = explode(': ', $line);
							$headers[$key][] = $value;
						}
					}
				}
				return $headers;
			}

			$values = preg_split("/\R\R/", $response, 2);
			$header = isset( $values[0] ) ? $values[0] : '';
			$body   = isset( $values[1] ) ? $values[1] : '';
			preg_match('|HTTP/\d\.\d\s+(\d+)\s+.*|',$header,$match);
			$status = $match[1];
			$headers = get_headers_from_curl_response($header);

			$response = Response::make( $body ? $body : '', $status );

			if( isset( $headers ) && array_key_exists( 'Content-Type', $headers ) ){
				$response->header('Content-Type', $headers['Content-Type'][0]);
			}

			// handle 301 / 302 redirect locations
			//
			if( in_array( $status, array('301','302') ) ){
				if( isset( $headers ) && array_key_exists( 'Location', $headers ) )
					$response->header('Location', $headers['Location'][0]);
			}

			// set JSESSIONID when present
			//
			if( array_key_exists( 'Set-Cookie', $headers ) ){
				foreach( $headers['Set-Cookie'] as $setcookie ){
					$response->header('Set-Cookie', $setcookie );
				}
			}

			return $response;
		}
	}
}


