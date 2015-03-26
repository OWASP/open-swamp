<?php namespace Lib\Session;

use Illuminate\Cookie\CookieJar;
use Symfony\Component\HttpFoundation\Request;
use Illuminate\Support\Facades\Config;

class SecureCookieSessionHandler implements \SessionHandlerInterface {

	/**
	 * The cookie jar instance.
	 *
	 * @var \Illuminate\Cookie\CookieJar
	 */
	protected $cookie;

	/**
	 * The request instance.
	 *
	 * @var \Symfony\Component\HttpFoundation\Request
	 */
	protected $request;


	/**
	 * Create a new cookie driven handler instance.
	 *
	 * @param  \Illuminate\Cookie\CookieJar  $cookie
	 * @param  int  $minutes
	 * @return void
	 */
	public function __construct(CookieJar $cookie, $minutes)
	{
		$this->cookie = $cookie;
		$this->minutes = $minutes;
	}

	/**
	 * {@inheritDoc}
	 */
	public function open($savePath, $sessionName)
	{
		return true;
	}

	/**
	 * {@inheritDoc}
	 */
	public function close()
	{
		return true;
	}

	/**
	 * {@inheritDoc}
	 */
	public function read($sessionId)
	{
		if( ! $this->request )
			return '';
		return $this->request->cookies->get($sessionId) ?: '';
	}

	/**
	 * {@inheritDoc}
	 */
	public function write($sessionId, $data)
	{
		// $this->setCookie($this->cookie->make($sessionId, $data, $this->minutes));
		$this->cookie->queue($sessionId, $data, $this->minutes);
	}

	/**
	 * {@inheritDoc}
	 */
	public function destroy($sessionId)
	{
		$this->cookie->queue($this->cookie->forget($sessionId));
	}

	/**
	 * Set the given cookie in the headers.
	 *
	 * @param  \Symfony\Component\HttpFoundation\Cookie  $cookie
	 * @return void
	 */
	protected function setCookie($cookie)
	{
		if (headers_sent()) return;

		setcookie($cookie->getName(), $cookie->getValue(), $cookie->getExpiresTime(), $cookie->getPath(), $cookie->getDomain(), Config::get('session.secure'), $cookie->isHttpOnly());
	}

	/**
	 * {@inheritDoc}
	 */
	public function gc($lifetime)
	{
		return true;
	}

	/**
	 * Set the request instance.
	 *
	 * @param  \Symfony\Component\HttpFoundation\Request  $request
	 * @return void
	 */
	public function setRequest(Request $request)
	{
		$this->request = $request;
	}


}
