	var vlancount = 0; //number of configured vlans
var ifcount = 0; //number of configured interfaces
var subcount = 0; //number of sub-interfaces
var routecount = 0; //number of IP routes
var routecountv6 = 0; //same but v6
var dhcpcount = 0; //number of dhcp pools
var router = false; //configured device
var vlanArray = [];
var ifArray = [];
var language = window.navigator.userLanguage || window.navigator.language;

//========================================================================================================================

function Router() //ROUTER CONFIG
{
    router = true;
    
    document.getElementById("router").style.background='#00FF00';
    document.getElementById("switch").style.background='#FFFFFF';
    
    document.getElementById("inputs").hidden = false;
    
    document.getElementById("interfaces").style.display = "inline-block";
    document.getElementById("routes").style.display = "inline-block";
    document.getElementById("routesv6").style.display = "inline-block";
    document.getElementById("dhcp").style.display = "inline-block";
    if(ifcount > 0) document.getElementById("subInfs").style.display = "inline-block";
    
    document.getElementById("gw").value = "";
    document.getElementById("Gateway").hidden = true;
    while(vlancount > 0) rmvVlan();
    document.getElementById("vlans").style.display = "none";
    
    document.getElementById("submit").hidden = false;
    document.getElementById("out").value = "";
    document.getElementById("outdiv").hidden = true;
    
    for(let i = 0; i < ifcount; i++){ //Hide Vlan parts on interfaces
        document.getElementById("vlanpart"+i).hidden = true;
        document.getElementById("ipv6part"+i).hidden = false;
        document.getElementById("trunk"+i).checked = false;
		document.getElementById("access"+i).checked = false;
    }
}

function Switch() //SWITCH CONFIG
{
    router = false;
    
    document.getElementById("switch").style.background='#00FF00';
    document.getElementById("router").style.background='#FFFFFF';
    
    document.getElementById("inputs").hidden = false;
    
    document.getElementById("vlans").style.display = "inline-block";
    document.getElementById("interfaces").style.display = "inline-block";
    document.getElementById("Gateway").hidden = false;
	for(let i = 0; i < ifcount; i++) document.getElementById("ipv6part"+i).hidden = true;
    
    while(subcount > 0) rmvSubInf();
    document.getElementById("subInfs").style.display = "none";
    while(routecount > 0) rmvRoute();
    document.getElementById("routes").style.display = "none";
    while(routecountv6 > 0) rmvRoutev6();
    document.getElementById("routesv6").style.display = "none";
    while(dhcpcount > 0) rmvdhcp();
    document.getElementById("dhcp").style.display = "none";
    
    document.getElementById("submit").hidden = false;
    document.getElementById("out").value = "";
    document.getElementById("outdiv").hidden = true;
}

//========================================================================================================================
//=====================================REMOTE ACCESS=========================================
function RemAcc(){
    let e = document.getElementById("remacc");
    if(e.options[e.selectedIndex].text == "none"){
        document.getElementById("accdom").hidden = true;
        document.getElementById("accusr").hidden = true;
        document.getElementById("accpwd").hidden = true;
    }
    else if(e.options[e.selectedIndex].text == "Telnet"){
        document.getElementById("accdom").hidden = true;
        document.getElementById("accusr").hidden = true;
        document.getElementById("accpwd").hidden = false;
    }
    else{
        document.getElementById("accdom").hidden = false;
        document.getElementById("accusr").hidden = false;
        document.getElementById("accpwd").hidden = false;
    }
}

//=====================================VLAN SELECTION=========================================

function setVlans(x)//update vlan array
{
    let vlannum = document.getElementById("vlannum"+x).value;
    vlanArray[x] = vlannum;
    
    getVlans();
}

function getVlans() //update vlan selections
{
    for(let i = 0; i < ifcount; i++){
        let trunk = document.getElementById("nativevlan"+i);
        let access = document.getElementById("accessvlan"+i);
        let trunkindex = trunk.selectedIndex;
        let accindex = access.selectedIndex;
        
        trunk.length = 1;
        access.length = 1;
        
        for(let j = 0; j < vlanArray.length; j++){
            let vlan = vlanArray[j];
            trunk.add(new Option(vlan,vlan), undefined);
            access.add(new Option(vlan,vlan), undefined);
        }
        
        if(trunkindex < trunk.length) trunk.selectedIndex = trunkindex;
        else trunk.selectedIndex = 0;
        if(accindex < access.length) access.selectedIndex = accindex;
        else access.selectedIndex = 0;

    }
}

//=====================================INTERFACE SELECTION=========================================

function setIFs(x)
{
    let iftypeobj = document.getElementById("if"+x);
    let iftype = iftypeobj.options[iftypeobj.selectedIndex].value;
    let ifnum = document.getElementById("ifnum"+x).value;
    
    ifArray[x] = iftype + " " + ifnum;
    
    getIFs();
}

function getIFs()
{
    for(let i = 0; i < subcount; i++){
        let subif = document.getElementById("subinfs"+i);
        let subindex = subif.selectedIndex;
        
        subif.length = 1;
        
        for(let j = 0; j < ifArray.length; j++){
            let inf = ifArray[j];
            subif.add(new Option(inf,inf), undefined);
        }
        
        if(subindex < subif.length) subif.selectedIndex = subindex;
        else subif.selectedIndex = 0;
    }
	
	for(let i = 0; i < routecount; i++){
		let route = document.getElementById("exitif"+i);
		let routeindex = route.selectedIndex;
		
		route.length = 1;
		
		for(let j = 0; j < ifArray.length; j++){
            let inf = ifArray[j];
			route.add(new Option(inf,inf), undefined);
		}
		
		if(routeindex < route.length) route.selectedIndex = routeindex;
        else route.selectedIndex = 0;
	}
	
	for(let i = 0; i < routecountv6; i++){
		let routev6 = document.getElementById("exitifv6"+i);
		let routev6index = routev6.selectedIndex;
		
		routev6.length = 1;
		
		for(let j = 0; j < ifArray.length; j++){
            let inf = ifArray[j];
			routev6.add(new Option(inf,inf), undefined);
		}
		
		if(routev6index < routev6.length) routev6.selectedIndex = routev6index;
        else routev6.selectedIndex = 0;
	}
}

//========================================================================================================================
//=====================================VLAN=========================================

function addVlan() //add
{
	//const vlanrow = "<p id="+'"'+"vlan"+vlancount+'"'+"> Vlan <input id="+'"'+"vlannum"+vlancount+'"'+" type="+'"'+"text"+'"'+" onchange="+'"'+"setVlans("+vlancount+")"+'"'+" style="+'"'+"width:30px"+'"'+" placeholder="+'"'+"10"+'"'+"><input id="+'"'+"vlanname"+vlancount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"VlanName"+'"'+"></p>";
	const vlanrow = `<p id="vlan${vlancount}">
						Vlan <input id="vlannum${vlancount}" type="text" onchange="setVlans(${vlancount})" style="width:30px" placeholder="10">
						<input id="vlanname${vlancount}" type="text" style="width:100px" placeholder="VlanName">
					</p>`;
	vlancount++;
	document.getElementById("vlans").insertAdjacentHTML('beforeend', vlanrow);
	
	if(ifcount > 0){
	    for(let i = 0; i < ifcount; i++) document.getElementById("vlanpart"+i).hidden = false;
	}
}
function rmvVlan() //remove
{
    if(vlancount > 0)
    {
        vlancount--;
        document.getElementById("vlan"+vlancount).remove();
        vlanArray.pop();
        getVlans();
        if(vlancount == 0){
            for(let i = 0; i < ifcount; i++) document.getElementById("vlanpart"+i).hidden = true;
        }
    }
}

//=====================================Interface=========================================
	
function addIF() //add
{
    //const ifrow = "<p id="+'"'+"interface"+ifcount+'"'+"><select id="+'"'+"if"+ifcount+'"'+" onchange="+'"'+"setIFs("+ifcount+")"+'"'+"><option value="+'"'+"FastEthernet"+'"'+">FastEthernet</option><option value="+'"'+"GigabitEthernet"+'"'+">GigabitEthernet</option><option value="+'"'+"Serial"+'"'+">Serial</option><option value="+'"'+"Vlan"+'"'+">Vlan</option></select><input id="+'"'+"ifnum"+ifcount+'"'+" type="+'"'+"text"+'"'+" onchange="+'"'+"setIFs("+ifcount+")"+'"'+" style="+'"'+"width:30px"+'"'+" placeholder="+'"'+"0/0/0"+'"'+"><input id="+'"'+"ip"+ifcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"192.168.1.1"+'"'+"><input id="+'"'+"mask"+ifcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"255.255.255.0"+'"'+"><input id="+'"'+"ipv6"+ifcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:270px"+'"'+" placeholder="+'"'+"2001:0db8:85a3:0000:0000:8a2e:0370:7334"+'"'+"><input id="+'"'+"maskv6"+ifcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:30px"+'"'+" placeholder="+'"'+"/64"+'"'+"> Link Local <input id="+'"'+"linklocal"+ifcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:80px"+'"'+" placeholder="+'"'+"FE80::ABC"+'"'+"><br><a id="+'"'+"vlanpart"+ifcount+'"'+" hidden><b>VLAN:  </b>trunk <input id="+'"'+"trunk"+ifcount+'"'+" type="+'"'+"checkbox"+'"'+"> native <select id="+'"'+"nativevlan"+ifcount+'"'+"><option>none</option></select> access <input id="+'"'+"access"+ifcount+'"'+" type="+'"'+"checkbox"+'"'+"><select id="+'"'+"accessvlan"+ifcount+'"'+"><option>none</option></select></a></p>";
	const ifrow = `<p id="interface${ifcount}">
						<select id="if${ifcount}" onchange="setIFs(${ifcount})"><option value="FastEthernet">FastEthernet</option><option value="GigabitEthernet">GigabitEthernet</option><option value="Serial">Serial</option><option value="Vlan">Vlan</option></select>
						<input id="ifnum${ifcount}" type="text" onchange="setIFs(${ifcount})" style="width:30px" placeholder="0/0/0">
						<input id="ip${ifcount}" type="text" style="width:100px" placeholder="192.168.1.1"><input id="mask${ifcount}" type="text" style="width:100px" placeholder="255.255.255.0">
						<a id="ipv6part${ifcount}" hidden>
							<input id="ipv6${ifcount}" type="text" style="width:290px" placeholder="2001:0db8:85a3:0000:0000:8a2e:0370:7334/64">
							Link Local <input id="linklocal${ifcount}" type="text" style="width:80px" placeholder="FE80::ABC">
						</a>
						<br>
						<a id="vlanpart${ifcount}" hidden>
							<b>VLAN:  </b>
							trunk <input id="trunk${ifcount}" type="checkbox">
							native <select id="nativevlan${ifcount}"><option>none</option></select>
							access <input id="access${ifcount}" type="checkbox"><select id="accessvlan${ifcount}"><option>none</option></select>
						</a>
					</p>`;
	ifcount++;
    document.getElementById("interfaces").insertAdjacentHTML('beforeend', ifrow);
    if(vlancount > 0) document.getElementById("vlanpart"+(ifcount-1)).hidden = false;
	if(router){
		document.getElementById("subInfs").style.display = "inline-block"; //show sub-interface config
		document.getElementById("ipv6part"+(ifcount-1)).hidden = false;
	}
	getVlans();
}
function rmvIF() //remove
{
    if(ifcount > 0)
    {
        ifcount--;
        document.getElementById("interface"+ifcount).remove();
        ifArray.pop();
        getIFs();
        if(ifcount == 0)
        {
            document.getElementById("subInfs").style.display = "none";
            while(subcount > 0) rmvSubInf();
        }
    }
}

//=====================================SubInterface=========================================

function addSubInf() //add
{	
	//const subinf = "<p id="+'"'+"subif"+subcount+'"'+"> <select id="+'"'+"subinfs"+subcount+'"'+"><option>none</option></select> Vlan <input id="+'"'+"subvlannum"+subcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:30px"+'"'+" placeholder="+'"'+"10"+'"'+"> IP <input id="+'"'+"subip"+subcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"192.168.1.100"+'"'+"><input id="+'"'+"submask"+subcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"255.255.255.0"+'"'+"> IPv6 <input id="+'"'+"subipv6"+subcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:150px"+'"'+" placeholder="+'"'+"2001:117:CAD:3::FF/64"+'"'+"></p>";
	const subinf = `<p id="subif${subcount}">
						<select id="subinfs${subcount}"><option>none</option></select>
						Vlan <input id="subvlannum${subcount}" type="text" style="width:30px" placeholder="10">
						IP <input id="subip${subcount}" type="text" style="width:100px" placeholder="192.168.1.100"><input id="submask${subcount}" type="text" style="width:100px" placeholder="255.255.255.0">
						IPv6 <input id="subipv6${subcount}" type="text" style="width:150px" placeholder="2001:117:CAD:3::FF/64">
					</p>`;
	subcount++;
	document.getElementById("subInfs").insertAdjacentHTML('beforeend', subinf);
	getIFs();
}
function rmvSubInf() //remove
{
    if(subcount > 0)
    {
        subcount--;
        document.getElementById("subif"+subcount).remove();
    }
}

//=====================================IP Route=========================================

function addRoute() //add
{
	//const routerow = "<p id="+'"'+"route"+routecount+'"'+">IP Route <input id="+'"'+"destnet"+routecount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"192.168.1.0"+'"'+"><input id="+'"'+"netmask"+routecount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"255.255.255.0"+'"'+"><input id="+'"'+"nexthop"+routecount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"172.16.1.10"+'"'+"><select id="+'"'+"exitif"+routecount+'"'+"><option>none</option></select><input id="+'"'+"admdist"+routecount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:20px"+'"'+" placeholder="+'"'+"5"+'"'+"></p>";
	const routerow = `<p id="route${routecount}">
						IP Route <input id="destnet${routecount}" type="text" style="width:100px" placeholder="192.168.1.0"><input id="netmask${routecount}" type="text" style="width:100px" placeholder="255.255.255.0">
							<input id="nexthop${routecount}" type="text" style="width:100px" placeholder="172.16.1.10">
							<select id="exitif${routecount}"><option>none</option></select>
							<input id="admdist${routecount}" type="text" style="width:20px" placeholder="5">
						</p>`;
	routecount++;
	document.getElementById("routes").insertAdjacentHTML('beforeend', routerow);
	getIFs();
}
function rmvRoute() //remove
{
    if(routecount > 0)
    {
        routecount--;
        document.getElementById("route"+routecount).remove();
    }
}

//=====================================IPv6 Route=========================================

function addRoutev6() //add
{
	//const routerowv6 = "<p id="+'"'+"routev6"+routecountv6+'"'+">IPv6 Route <input id="+'"'+"destnetv6"+routecountv6+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:300px"+'"'+" placeholder="+'"'+"2001:1::2"+'"'+"><input id="+'"'+"netmaskv6"+routecountv6+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:40px"+'"'+" placeholder="+'"'+"/64"+'"'+"><input id="+'"'+"nexthopv6"+routecountv6+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:300px"+'"'+" placeholder="+'"'+"2055:10ab:efgh::2abc"+'"'+"><select id="+'"'+"exitifv6"+routecountv6+'"'+"><option>none</option></select><input id="+'"'+"admdistv6"+routecountv6+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:20px"+'"'+" placeholder="+'"'+"5"+'"'+"></p>";
	const routerowv6 = `<p id="routev6${routecountv6}">
							IPv6 Route <input id="destnetv6${routecountv6}" type="text" style="width:300px" placeholder="2001:1::2/64">
								<input id="nexthopv6${routecountv6}" type="text" style="width:300px" placeholder="2055:10ab:efgh::2abc">
								<select id="exitifv6${routecountv6}"><option>none</option></select>
								<input id="admdistv6${routecountv6}" type="text" style="width:20px" placeholder="5">
						</p>`;
	routecountv6++;
	document.getElementById('routesv6').insertAdjacentHTML('beforeend', routerowv6);
	getIFs();
}
function rmvRoutev6() //remove
{
    if(routecountv6 > 0)
    {
        routecountv6--;
        document.getElementById("routev6"+routecountv6).remove();
    }
}

//=====================================DHCP=========================================

function adddhcp() //add
{
	//const dhcprow = "<p id="+'"'+"dhcppool"+dhcpcount+'"'+"> Name <input id="+'"'+"dhcpname"+dhcpcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"LAN"+'"'+"> Network <input id="+'"'+"dhcpnet"+dhcpcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"192.168.1.0"+'"'+"><input id="+'"'+"dhcpmask"+dhcpcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"255.255.255.0"+'"'+"> Gateway <input id="+'"'+"dhcpgw"+dhcpcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"192.168.1.254"+'"'+"> DNS <input id="+'"'+"dhcpdns"+dhcpcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"8.8.8.8"+'"'+"> Domain <input id="+'"'+"dhcpdomain"+dhcpcount+'"'+" type="+'"'+"text"+'"'+" style="+'"'+"width:100px"+'"'+" placeholder="+'"'+"cisco.com"+'"'+"></p>";
	const dhcprow = `<p id="dhcppool${dhcpcount}">
						Name <input id="dhcpname${dhcpcount}" type="text" style="width:100px" placeholder="LAN">
						Network <input id="dhcpnet${dhcpcount}" type="text" style="width:100px" placeholder="192.168.1.0"><input id="dhcpmask${dhcpcount}" type="text" style="width:100px" placeholder="255.255.255.0">
						Gateway <input id="dhcpgw${dhcpcount}" type="text" style="width:100px" placeholder="192.168.1.254"> DNS <input id="dhcpdns${dhcpcount}" type="text" style="width:100px" placeholder="8.8.8.8">
						Domain <input id="dhcpdomain${dhcpcount}" type="text" style="width:100px" placeholder="cisco.com">
					</p>`;
	dhcpcount++;
	
	document.getElementById('dhcp').insertAdjacentHTML('beforeend', dhcprow);
}
function rmvdhcp() //remove
{
    if(dhcpcount > 0)
    {
        dhcpcount--;
        document.getElementById("dhcppool"+dhcpcount).remove();
    }
}

//============================================================HELPFUL STUFF============================================================

function cpText() //copy config to clipboard
{
    let range = document.createRange();
    range.selectNode(document.getElementById("out"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
}

function osimodel()
{
	if(language == "cs"){
		window.open("http://cisco.jednoduse.cz/graphics/OSImodelCzech.png", "_blank");
	}
	else{
		window.open("http://cisco.jednoduse.cz/graphics/OSImodel.png", "_blank");
	}
}

//=====================================HELPING DIALOG=========================================
function closeDialog()
{
	document.getElementById("dialogWindow").style.display = "none";
}

function showDialog(id)
{
	document.getElementById("dialogWindow").style.display = "block";
		
	if(id == "0"){ //testing Dialog
		document.getElementById("dialogHeader").textContent = "Test";
		
	}
	else if(id == "1"){//=====================================VLAN=========================================
		document.getElementById("dialogHeader").textContent = "Vlan Info";
		document.getElementById("dialogContent").innerHTML = "";
		
		const info = `<img src="/graphics/help/vlan.png" style="width:1000px; margin:10px; margin-top: -8px;"><br>
					<i style="color:#ED1C24">*required</i>  <i style="color:#22B14C">*optional</i>
					<ul align="left">
						<li><b style="color:#ED1C24">VLAN Number</b> - The number of the VLAN <i>(1-4094)</i></li>
						<li><b style="color:#22B14C">VLAN Name</b> - The name for the VLAN</li>
					</ul>`;
		
		document.getElementById('dialogContent').insertAdjacentHTML('beforeend', info);
	}
	else if(id == "2"){//=====================================INTERFACE=========================================
		document.getElementById("dialogHeader").textContent = "Interface Info";
		document.getElementById("dialogContent").innerHTML = "";
		
		const info = `<img src="/graphics/help/interface.png" style="width:1000px; margin:10px; margin-top: -8px;"><br>
					<i style="color:#ED1C24">*required</i>  <i style="color:#22B14C">*optional</i>
					<ul align="left">
						<li><b style="color:#ED1C24">Interface Selection</b> - The interface type</li>
						<li><b style="color:#ED1C24">Interface Number</b> - The interface number</li>
						<li><b style="color:#22B14C">IP Address + Mask</b> - IP address of the interface consists of 4 numbers <i>(0-255)</i> devided by dots <i>(A.B.C.D)</i><br>
											<a style="margin-left: 175px">- Subnet mask of the IP address consists of 4 numbers in a special odrer: <button onclick="showDialog(21)">O</button></a></li>
						<li><b style="color:#22B14C">IPv6 Address/Mask</b> - IPv6 address of the interface consists of 8 octets of hexadecimal numbers<br>
											<a style="margin-left: 184px">- Subnet mask is usually in a prefix format in this order: <button onclick="showDialog(22)">O</button></a></li>
						<li><b style="color:#22B14C">Link-Local Address</b> - IPv6 address only for local network. Interfaces can have the same address.<br>
											<a style="margin-left: 176px">- First 10 bits are static so the first octet must be in range <b>FE80 - FEBF</b></a></li>
					</ul>
					<h4 style="text-align: left; margin-left: 15px; margin-bottom: -10px">VLAN Configuration (only on a switch):</h4>
					<ul align="left">
						<li><b style="color:#22B14C">Trunk Mode</b> - Trunk all vlan traffic through this interface</li>
						<li><b style="color:#22B14C">Trunk Native VLAN</b> - Default vlan number to assign if a packet isn't tagged with VLAN header</li>
						<li><b style="color:#22B14C">Access Mode + VLAN</b> - Make this interface an access for a specific vlan</li>
					</ul>`;
		
		document.getElementById('dialogContent').insertAdjacentHTML('beforeend', info);
	}
	else if(id == "3"){//=====================================SUB-INTERFACE=========================================
		document.getElementById("dialogHeader").textContent = "Sub-Interface Info";
		document.getElementById("dialogContent").innerHTML = "";

		const info = `<img src="/graphics/help/sub-interface.png" style="width:1000px; margin:10px; margin-top: -8px;"><br>
					<i style="color:#ED1C24">*required</i>  <i style="color:#22B14C">*optional</i>
					<ul align="left">
						<li><b style="color:#ED1C24">Interface Selection</b> - The interface on which you want to create a sub-interface</li>
						<li><b style="color:#ED1C24">VLAN Number</b> - The number of a VLAN to connect to this sub-interface</li>
						<li><b style="color:#ED1C24">IP Address + Mask</b> - Normal IP configuration for the VLAN <i>"gateway"</i></li>
						<li><b style="color:#22B14C">IPv6 Address/Mask</b> - Normal IPv6 configuration for the VLAN <i>"gateway"</i></li>
					</ul>`;
					
		document.getElementById('dialogContent').insertAdjacentHTML('beforeend', info);
	}
	else if(id == "4"){//=====================================IP ROUTE=========================================
		document.getElementById("dialogHeader").textContent = "IP Route Info";
		document.getElementById("dialogContent").innerHTML = "";

		const info = `<img src="/graphics/help/ip-route.png" style="width:1000px; margin:10px; margin-top: -8px;"><br>
					<i style="color:#ED1C24">*required</i>  <i style="color:#22B14C">*optional</i>
					<ul align="left">
						<li><b style="color:#ED1C24">Destination IP + Mask</b> - The address of destination device</li>
						<li><b style="color:#22B14C">Next-Hop</b> - The IP address of the next router on the route to destination device</li>
						<li><b style="color:#22B14C">Exit Interface</b> - The interface on which the <i>"next-hop"</i> router is connected<br>
										<a style="margin-left: 129px">- <b>Should only be used on serial connection!</b></a></li>
						<li><b style="color:#22B14C">Administrative Distance</b> - If multiple routes exist, the router chooses one with the <b>lowest</b> distance <i>(0-255)</i></li>
					</ul>`;
		
		document.getElementById('dialogContent').insertAdjacentHTML('beforeend', info);
	}
	else if(id == "5"){//=====================================IPv6 ROUTE=========================================
		document.getElementById("dialogHeader").textContent = "IPv6 Route Info";
		document.getElementById("dialogContent").innerHTML = "";

		const info = `<img src="/graphics/help/ipv6-route.png" style="width:1000px; margin:10px; margin-top: -8px;"><br>
					<i style="color:#ED1C24">*required</i>  <i style="color:#22B14C">*optional</i>
					<ul align="left">
						<li><b style="color:#ED1C24">Destination IPv6/Mask</b> - The address of destination device</li>
						<li><b style="color:#22B14C">Next Hop</b> - The IPv6 address of the next router on the route to destination device</li>
						<li><b style="color:#22B14C">Exit Interface</b> - The interface on which the <i>"next-hop"</i> router is connected<br>
										<a style="margin-left: 129px">- <b>Should only be used on serial connection!</b></a></li>
						<li><b style="color:#22B14C">Administrative Distance</b> - If multiple routes exist, the router chooses one with the <b>lowest</b> distance <i>(0-255)</i></li>
					</ul>`;
		
		document.getElementById('dialogContent').insertAdjacentHTML('beforeend', info);
	}
	else if(id == "6"){//=====================================DHCP=========================================
		document.getElementById("dialogHeader").textContent = "DHCP Pool Info";
		document.getElementById("dialogContent").innerHTML = "";

		const info = `<img src="/graphics/help/dhcp-pool.png" style="width:1000px; margin:10px; margin-top: -8px;"><br>
						<i style="color:#ED1C24">*required</i>  <i style="color:#22B14C">*optional</i>
						<ul align="left">
							<li><b style="color:#ED1C24">Pool Name</b> - Just a name to identify the network</li>
							<li><b style="color:#ED1C24">Network IP + Mask</b> - The address of the network</li>
							<li><b style="color:#ED1C24">Gateway</b> - Should be the IP address of the interface on which the network is connected</li>
							<li><b style="color:#22B14C">DNS Server</b> - Ip address of your desired DNS server</li>
							<li><b style="color:#22B14C">Domain</b> - A domain name for your network</li>
						</ul>`;
		
		document.getElementById('dialogContent').insertAdjacentHTML('beforeend', info);
	}
	else if(id == "11"){//=====================================ROUTER CONFIG=========================================
		document.getElementById("dialogHeader").textContent = "Configure Router";
		document.getElementById("dialogContent").style.width = "1250px";
		Router();
	}
	else if(id == "12"){//=====================================SWITCH CONFIG=========================================
		document.getElementById("dialogHeader").textContent = "Configure Switch";
		document.getElementById("dialogContent").style.width = "1250px";
		Switch();
	}
	else if(id == "21"){//=====================================SUBNET MASK=========================================
		document.getElementById("dialogHeader").textContent = "IPv4 Subnet Masks";
		document.getElementById("dialogContent").innerHTML = "";

		const info = `<p style="text-align: left; margin-left: 15px; margin-right: 50px;">
						The number of usable IPs is the range of IPs excluding the Network IP <i>(lowest IP)</i> and the Brodcast IP <i>(highest IP)</i><br>
						Only exceptions are prefixes /32 and /31 whitch would otherwise be useless.<br>
						<b>/32</b> is set as a single IP<br>
						<b>/31</b> is used for <a href="https://www.rfc-editor.org/rfc/rfc3021">Point-to-Point connections</a> <i>(eg. [Router -> Router] with Serial connection)</i><br>
						<b>/0</b> is considered to be the internet
					</p>
					<table style="margin: 20px">
						<tr><th>Prefix</th><th>Subnet Mask</th><th>Usable IPs</th></tr>
						<tr><td>/32</td><td>255.255.255.255</td><td>1</td></tr>
						<tr><td>/31</td><td>255.255.255.254</td><td>2 (PtP)</td></tr>
						<tr><td>/30</td><td>255.255.255.252</td><td>2</td></tr>
						<tr><td>/29</td><td>255.255.255.248</td><td>6</td></tr>
						<tr><td>/28</td><td>255.255.255.240</td><td>14</td></tr>
						<tr><td>/27</td><td>255.255.255.224</td><td>30</td></tr>
						<tr><td>/26</td><td>255.255.255.192</td><td>62</td></tr>
						<tr><td>/25</td><td>255.255.255.128</td><td>126</td></tr>
						<tr><td>/24</td><td>255.255.255.0</td><td>254</td></tr>
						<tr><td>/23</td><td>255.255.254.0</td><td>510</td></tr>
						<tr><td>/22</td><td>255.255.252.0</td><td>1,022</td></tr>
						<tr><td>/21</td><td>255.255.248.0</td><td>22,046</td></tr>
						<tr><td>/20</td><td>255.255.240.0</td><td>4,094</td></tr>
						<tr><td>/19</td><td>255.255.224.0</td><td>8,190</td></tr>
						<tr><td>/18</td><td>255.255.192.0</td><td>16,382</td></tr>
						<tr><td>/17</td><td>255.255.128.0</td><td>32,766</td></tr>
						<tr><td>/16</td><td>255.255.0.0</td><td>65,534</td></tr>
						<tr><td>/15</td><td>255.254.0.0</td><td>131,070</td></tr>
						<tr><td>/14</td><td>255.252.0.0</td><td>262,142</td></tr>
						<tr><td>/13</td><td>255.248.0.0</td><td>524,286</td></tr>
						<tr><td>/12</td><td>255.240.0.0</td><td>1,048,574</td></tr>
						<tr><td>/11</td><td>255.224.0.0</td><td>2,097,150</td></tr>
						<tr><td>/10</td><td>255.192.0.0</td><td>4,194,302</td></tr>
						<tr><td>/9</td><td>255.128.0.0</td><td>8,388,606</td></tr>
						<tr><td>/8</td><td>255.0.0.0</td><td>16,777,214</td></tr>
						<tr><td>/7</td><td>254.0.0.0</td><td>33,554,430</td></tr>
						<tr><td>/6</td><td>252.0.0.0</td><td>67,108,862</td></tr>
						<tr><td>/5</td><td>248.0.0.0</td><td>134,217,726</td></tr>
						<tr><td>/4</td><td>240.0.0.0</td><td>268,435,454</td></tr>
						<tr><td>/3</td><td>224.0.0.0</td><td>536,870,910</td></tr>
						<tr><td>/2</td><td>192.0.0.0</td><td>1,073,741,822</td></tr>
						<tr><td>/1</td><td>128.0.0.0</td><td>2,147,483,646</td></tr>
						<tr><td>/0</td><td>0.0.0.0</td><td>4,294,967,294</td></tr>
					</table>`;
		
		document.getElementById('dialogContent').insertAdjacentHTML('beforeend', info);
	}
	else if(id == "22"){//=====================================SUBNET MASK IPv6=========================================
		document.getElementById("dialogHeader").textContent = "IPv6 Subnet Masks";
		document.getElementById("dialogContent").innerHTML = "";

		const info = `<p style="text-align: left; margin-left: 15px; margin-right: 50px;">
						IPv6 is made up from 8 octets devided by colons. Every octet consist of 4 characters in hexadecimal.<br>
						The number of usable IPs is the range of IPs excluding the Network IP <i>(lowest IP)</i> and the Brodcast IP <i>(highest IP)</i><br>
						<b>/128</b> is set as a single IP as you would on a computer<br>
						<b>/0</b> is considered to be the internet
					</p>
					<table style="margin: 20px">
						<tr><th>Prefix</th><th>Subnet Mask</th><th>Usable IPs</th></tr>
						<tr><td>/128</td><td>FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF</td><td>1</td></tr>
						<tr><td>/112</td><td>FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:</td><td>65,534</td></tr>
						<tr><td>/96</td><td>FFFF:FFFF:FFFF:FFFF:FFFF:FFFF::</td><td>4,294,967,294</td></tr>
						<tr><td>/80</td><td>FFFF:FFFF:FFFF:FFFF:FFFF::</td><td>281,474,976,710,654</td></tr>
						<tr><td>/64</td><td>FFFF:FFFF:FFFF:FFFF::</td><td>18,446,744,073,709,551,614</td></tr>
						<tr><td>/48</td><td>FFFF:FFFF:FFFF::</td><td>1,208,925,819,614,629,174,706,174</td></tr>
						<tr><td>/32</td><td>FFFF:FFFF::</td><td>79,228,162,514,264,337,593,543,950,334</td></tr>
						<tr><td>/16</td><td>FFFF::</td><td>5,192,296,858,534,827,628,530,496,329,220,094</td></tr>
						<tr><td>/0</td><td>::</td><td>340,282,366,920,938,463,463,374,607,431,768,211,454</td></tr>
					</table>`;
		
		document.getElementById('dialogContent').insertAdjacentHTML('beforeend', info);
	}
	else{
		document.getElementById("dialogWindow").style.display = "none";
		document.getElementById("dialogContent").style.width = "1000px"
	}
}
