#!/usr/bin/env ruby
require 'rubygems'
require 'json'
require 'em-websocket'
require 'pp'

$CHARS = {}

EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080, :debug => false) do |ws|
  ws.onopen { puts "Connected..."}
  ws.onclose { puts "Closed..." }
  ws.onmessage do |msg|
    if msg == 'refresh'
    else
      entry = JSON.parse(msg)
      $CHARS[entry['uid']] = entry
    end
    pp $CHARS
    ws.send(JSON($CHARS))
  end
end
