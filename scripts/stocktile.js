Office.initialize = function (reason) {
    // might need to record somewhere if we haven't loaded it
    
    
    $(document).ready(function(){
        ga('send','event','session','pageLoad','documentReady');
        var contiguousUpdates = 0;
        var refreshPeriod = 60000;
        
        // remove the ad, if necessary
        /*
        
        if(Office.context.touchEnabled){
            document.getElementById("stockconnector").innerHTML = "link";
        }
        */
        if(Office.context.touchEnabled && (!Office.context.document.bindings || !Office.context.document.bindings.addFromPromptAsync)){
            document.getElementById("stockconnector").style.visibility = "hidden";
        }
        
        $("#setTicker").click(function(){
            $("#ticker").html("mop");
            var ticker = $("#ticker").val();
            Office.context.document.settings.set("ticker",ticker.trim().toUpperCase());
            Office.context.document.settings.saveAsync();
            getQuoteAsync(ticker,updateQuote,true);
            ga('send','event','button','click','setStockButton');
        });
        
        $("#debug").click(function(){
           //update the price and counters
           getQuoteAsync(Office.context.document.settings.get("ticker"),updateQuote,false);           
        });
        
        $("#help").click(function(){
            window.open("http://michael-saunders.com/stocktile/pages/help.html","Help","status=yes, toolbar=yes, menubar=yes, location=yes, resizable=yes, scrollbars=yes");
            ga('send','event','button','click','helpButton');
        });
        $("#stockconnector").click(function(){
            window.open("https://store.office.com/stock-connector-WA104379220.aspx?assetid=WA104379220","StockConnector","status=yes, toolbar=yes, menubar=yes, location=yes, resizable=yes, scrollbars=yes");
            ga('send','event','button','click','tileToConnector');
        });
        
        
        function testJQ(){
            document.getElementById("ticker").innerHTML = "mopa";
        }
        
        $(".display").css(
                "font-size",
                String($(this).height() / 3.6) + "px"
        );
        $("#debug").css(
                "font-size",
                String($(this).height() / 11) + "px"
        );
        $(window).on('resize',function(){
            $(".display").css(
                "font-size",
                String($(this).height() / 3.6) + "px"
            );
            $("#debug").css(
                "font-size",
                String($(this).height() / 11) + "px"
            );
        });
        
        $(document).click(function(event){
            contiguousUpdates = 0; 
        });
        
        function nextPriceFetch(){
            getQuoteAsync(Office.context.document.settings.get("ticker"),updateQuote,true);
        }
        
        function startLoadingUX(){
            
        }
        function stopLoadingUX(){
            
        }
        function showSplashPage(){
            $(".display").hide();
            $("#debug").hide(); 
            $(".splash").show();
        }
        function showDisplayPage(){
            $(".splash").hide();
            $(".display").show();
            $("#debug").show();
        }
        
        function updateQuote(price,change,timestamp,normalCycle){
            //document.getElementById("debug2").innerHTML += " updating the quote page";
            
            $("#stockName").html(Office.context.document.settings.get("ticker"));
            $("#price").html(parseFloat(price).toFixed(2));
            $("#change").html(change.substring(0,1) + String(parseFloat(change.substring(1)).toFixed(2)));
            //document.getElementById("debug2").innerHTML += " " + timestamp.substring(5,7) + "/" + timestamp.substring(8,10) + "/" + timestamp.substring(0,4) + " " + timestamp.substring(11,16) + ":00 UTC";
            var myTime = new Date(timestamp.substring(5,7) + "/" + timestamp.substring(8,10) + "/" + timestamp.substring(0,4) + " " + timestamp.substring(11,16) + ":00 UTC");
            var ampm = "AM";
            var myHours = myTime.getHours();
            var myMinutes = myTime.getMinutes();
            if(myHours > 12){
                ampm = "PM";
                if(myHours == 24){
                    ampm = "AM";
                }
                myHours -= 12;
                //myTime.setHours(myHours);
            }
            else if(myHours == 12){
                ampm = "PM";
            }
            if(myMinutes < 10){
                myMinutes = "0" + myMinutes;
            }
            $("#debug").html(parseInt(myHours,10) + ":" + myMinutes + " " + ampm);
            
            contiguousUpdates++;
            if(change.indexOf("-") > -1){
                $(".display").css("background-color","rgb(166,22,22)");
                $("body").css("background-color","rgb(166,22,22)");
            }
            else{
                $(".display").css("background-color","rgb(27,119,38)");
                $("body").css("background-color","rgb(27,119,38)");
            }
            //document.getElementById("debug2").innerHTML += " will show display page";
            showDisplayPage();            
            
            if(normalCycle){
                //document.getElementById("debug2").innerHTML += " normal cycle timeout";
                if(contiguousUpdates >= 5){
                refreshPeriod = 900000;    // 15 minutes
                }
                else{
                    refreshPeriod = 60000; // 1 minute
                }
                
                setTimeout(function(){
                    nextPriceFetch();
                },refreshPeriod);
            }
            
        }
        
        function getQuoteAsync(ticker,callback,normalCycle){
            ga('send','event','data','query',ticker.toUpperCase());
            startLoadingUX();
			
			var myUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20symbol%2CChange%2CLastTradeTime%2CLastTradePriceOnly%2CName%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22";
			// Yahoo Finance returns caches results if it recognizes the query, so I generate a random fake stock at the end of the list
			var cacheKiller = Math.floor(Math.random()*10000000).toString(32).toUpperCase(); 
			myUrl += ticker.trim() + "%22%2C%22" + cacheKiller + "%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
			
			/* code that failed the cache
            var myUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20%3D%20%22";
            myUrl += ticker.trim() + "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
			*/
            $.getJSON(myUrl, function(data){
                //document.getElementById("debug2").innerHTML += " got json";
                stopLoadingUX();
                //document.getElementById("debug2").innerHTML += " " + data.query.created;
                //var price = data.query.results.quote.LastTradePriceOnly; cache didn't kill
				var price = data.query.results.quote[0].LastTradePriceOnly;
                if(price && price != "0.00"){
                    callback(price, data.query.results.quote[0].Change, data.query.created,normalCycle);
                }
                //else don't callback
                // last, change, timestamp, whether to keep updating regularly
            });
        }
        
        if(window.top==window){
            //not in iframe            
        }
        else
        {
        }
        
        if(Office.context.document.settings.get("ticker")){
            //document.getElementById("debug2").innerHTML += "\n" + "got ticker";
            nextPriceFetch();
        }
        else{
            showSplashPage();
            //document.getElementById("debug2").innerHTML += "\n" + "no ticker";
        }
    });
}

