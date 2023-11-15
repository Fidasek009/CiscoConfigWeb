var output;
var currentlvl;//0-default 1-enable 2-conf t 3-interface 
const cmds = ["enable <br>", "configure terminal <br>", "interface "];


//=========================================================MAIN FUNCTION===============================================================

function goAss()
{
    output = "";
	currentlvl = 0;
	alerts = 0;

    let hostname = document.getElementById("hostname").value;
    let password = document.getElementById("password").value;
    let secret = document.getElementById("secret").value;
    let remaccobj = document.getElementById("remacc");
    let pwdencrypt = document.getElementById("pwdencrypt");
    let motd = document.getElementById("motd").value;
    let gw = document.getElementById("gw").value;
    let save = document.getElementById("save");

    if(hostname != "") // HOSTNAME
	{
		levels(2);
		output += "hostname " + hostname + "<br>";
	}
	
	if(password != "") // PASSWORD
	{
		levels(2);
		output += "line con 0 " + "<br>" + "password " + password + "<br>" + "login" + "<br>" + "exit" + "<br>";
    }
		
	if(secret != "") // ENABLE SECRET
	{
	    levels(2);
	    output += "enable secret " + secret + "<br>";
	}
	
	if(remaccobj.options[remaccobj.selectedIndex].text != "none") //REMOTE ACCESS
	{
	    levels(2);
	    let accpwd = document.getElementById("accpwd").value;
	    if(accpwd == "") accpwd = password;
	    
	    if(remaccobj.options[remaccobj.selectedIndex].text == "Telnet"){ //TELNET
	        output += "line vty 0 15" + "<br>" + "transport input telnet" + "<br>" + "password " + accpwd + "<br>" + "login" + "<br>" + "exit" + "<br>";
	    }
	    else{ //SSH
	        let accdom = document.getElementById("accdom").value;
	        let accusr = document.getElementById("accusr").value;
	        
	        if(accdom != "" && accusr != ""){
	            output += "ip domain-name " + accdom + "<br>" + "username " + accusr + " secret " + accpwd + "<br>";
	            output += "crypto key generate rsa" + "<br>" + "1024" + "<br>" + "ip ssh version 2" + "<br>";
	            output += "line vty 0 15" + "<br>" + "login local" + "<br>" +  "transport input ssh" + "<br>" + "exit" + "<br>";
	        }
	    }
	}
	
	if(pwdencrypt.checked == true) // PASSWORD ENCRYPTION
	{
	    levels(2);
	    output += "service password-encryption" + "<br>";
	}
	
	if(motd != "") // SHIT MSG
	{
	    levels(2);
	    output += "banner motd " + '"' + motd + '"' + "<br>";
	}
	
	if(gw != "") // IPv4 GATEWAY
	{
	    levels(2);
	    output += "ip default-gateway " + gw + "<br>";
	}
	
//=====================================VLANS=========================================
	
	if(vlancount > 0)
	{
		levels(2);
		for(let i = 0; i < vlancount; i++)
		{
			let vnum = document.getElementById("vlannum"+i).value;
			let name = document.getElementById("vlanname"+i).value;
			
			if(vnum != "")
			{
				output += "vlan " + vnum + "<br>";
			}
			
			if(name != "")
			{
				output += "name " + name + "<br>";
			}
		}
		
		output += "exit" + "<br>";
	}
	
//=====================================INTERFACES=========================================
	
	if(ifcount > 0)
	{
		for(let i = 0; i < ifcount; i++)
		{
			levels(3);
			let e = document.getElementById("if"+i);
			let inf = e.options[e.selectedIndex].text;
			let infnum = document.getElementById("ifnum"+i).value;
			let ipv4 = document.getElementById("ip"+i).value;
			let netmask = document.getElementById("mask"+i).value;
			let ipv6 = document.getElementById("ipv6"+i).value;
			let link = document.getElementById("linklocal"+i).value;
			let trunk = document.getElementById("trunk"+i);
			let nativeobj = document.getElementById("nativevlan"+i);
			let native = nativeobj.options[nativeobj.selectedIndex].value;
			let acc = document.getElementById("access"+i);
			let accvlanobj = document.getElementById("accessvlan"+i);
			let accvlan = accvlanobj.options[accvlanobj.selectedIndex].value;
			
		
			if(inf != "" && infnum != "")
			{
				output += inf + " " + infnum + "<br>" + "no shutdown" + "<br>";
				
				if(ipv4 != "" && netmask != "")
				{
					output += "ip address " + ipv4 + " " + netmask + "<br>";
				}
				else if(ipv4 == "" && netmask != "" || ipv4 != "" && netmask == "") alert("if you have one of ipv4 setting, you need to have the other one too - ipv4 address / mask");
				
				if(ipv6 != "")
				{
					output += "ipv6 address " + ipv6 + "<br>";
				}
				
				if(trunk.checked == true)
				{
					output += "switchport mode trunk" + "<br>" + "switchport trunk encapsulation dot1q" + "<br>";
				}
				
				if(native != "none")
				{
					output += "switchport trunk native vlan " + native + "<br>";
				}
				
				if(link != "")
				{
					output += "ipv6 address " + link + " link-local" + "<br>";
				}
				
				if(acc.checked == true && accvlan != "none")
				{
					output += "switchport mode access" + "<br>" + "switchport acces vlan " + accvlan + "<br>";
				}
				else if(acc.checked == true && accvlan == "none" || acc.checked == false && accvlan != "none") alert("if you have one of access setting, you need to have the other one too - access port / access vlan");
				
			}
			else alert("interface cant be null");
			levels(2);
		}
	}

//=====================================SUB-INTERFACES=========================================

	if(subcount > 0)
	{
		for(let i = 0; i < subcount; i++)
		{
			let x = document.getElementById("subinfs"+i);
			let inf = x.options[x.selectedIndex].value;
			let subvlan = document.getElementById("subvlannum"+i).value;
			let subip = document.getElementById("subip"+i).value;
			let submask = document.getElementById("submask"+i).value;
			let subipv6 = document.getElementById("subipv6"+i).value;
			levels(3);
			
			if(inf != "none" && subvlan != "")
			{
				output += inf + "." + subvlan + "<br>" + "no shutdown" + "<br>";
				output += "encapsulation dot1q " + subvlan + "<br>";
				
				if(subip != "" && submask != "")
				{
					output += "ip address " + subip + " " + submask + "<br>";
				}
				else if(subip == "" && submask != "" || subip != "" && submask == "") alert("if you have one of sub-interfaces settings, you need to have the other one too - sub-ip address / sub-mask");
				
				if(subipv6 != "")
				{
				    output += "ipv6 address " + subipv6 + "<br>";
				}
			}
			
			levels(2);
		}
	}
	else if(subcount > 0 && vlancount == 0) alert("you cant use sub-interfaces without using Vlans");
	
//=====================================IP ROUTES=========================================
	
	if(routecount > 0)
	{
		levels(2);
		for(let i = 0; i < routecount; i++)
		{
			let dest = document.getElementById("destnet"+i).value;
			let Rmask = document.getElementById("netmask"+i).value;
			let hop = document.getElementById("nexthop"+i).value;
			let exif = document.getElementById("exitif"+i).value;
			let ad = document.getElementById("admdist"+i).value;
			
			if(dest != "")
			{
				output += "ip route " + dest;
			}
			else alert("destination network cant be null");
			
			if(Rmask != "")
			{
				output += " " + Rmask;
			}
			else alert("network mask cant be null");
			
			if(hop != "" || exif != "" || hop != "" && exif != "")
			{
				if(hop != "")
				{
					output += " " + hop;
				}
			
				if(exif != "none")
				{
					output += " " + exif;
				}
			}
			else alert("at least one of two must be filled - exit interface / nexthop");
			
			if(ad != "")
			{
				output += " " + ad;
			}
			
			output += "<br>";
		}
	}
	
//=====================================IPv6 ROUTES=========================================
	
	if(routecountv6 > 0)
	{
		levels(2);
		output += "ipv6 unicast-routing" + "<br>";
		for(let i = 0; i < routecountv6; i++)
		{
			let destv6 = document.getElementById("destnetv6"+i).value;
			let hopv6 = document.getElementById("nexthopv6"+i).value;
			let exifv6 = document.getElementById("exitifv6"+i).value;
			let adv6 = document.getElementById("admdistv6"+i).value;
			
			if(destv6 != "")
			{
				output += "ipv6 route " + destv6;
			}
			else alert("destination network cant be null");
			
			
			if(hopv6 != "" || exifv6 != "" || hopv6 != "" && exifv6 != "")
			{
				if(hopv6 != "")
				{
					output += " " + hopv6;
				}
			
				if(exifv6 != "none")
				{
					output += " " + exifv6;
				}
			}
			else alert("at least one of two must be filled - exit interface / nexthop");
			
			if(adv6 != "")
			{
				output += " " + adv6;
			}
			
			output += "<br>";
	   }
	}
	
//=====================================DHCP POOL=========================================
	
	if(dhcpcount > 0)
	{
		levels(2);

		for(let i = 0; i < dhcpcount; i++)
		{
			let dhcpname = document.getElementById("dhcpname"+i).value;
			let dhcpnet = document.getElementById("dhcpnet"+i).value;
			let dhcpmask = document.getElementById("dhcpmask"+i).value;
			let dhcpgw = document.getElementById("dhcpgw"+i).value;
			let dhcpdns = document.getElementById("dhcpdns"+i).value;
			let dhcpdomain = document.getElementById("dhcpdomain"+i).value;
			
			if(dhcpname != "")
			{
				output += "ip dhcp pool " + dhcpname + "<br>";
				
				if(dhcpnet != "" && dhcpmask != "")
				{
					output += "network " + dhcpnet + " " + dhcpmask + "<br>";
				}
				else alert("DHCP network and prefix cant be null");
				
				if(dhcpgw != "")
				{
					output += "default-router " + dhcpgw + "<br>";
				}
				else alert("DHCP gateway cant be null");
				
				if(dhcpdns != "")
				{
					output += "dns-server " + dhcpdns + "<br>";
				}
				
				if(dhcpdomain != "")
				{
					output += "domain-name " + dhcpdomain + "<br>";
				}
			}
			else alert("DHCP name cant be null");
	   }
	   output += "end" + "<br>";
	}
//=====================================COPY RUN-CONF TO START-CONF=========================================
	
	if(save.checked == true)
	{
	    levels(1);
	    output += "copy running-config startup-config" + "<br>";
	}

//=====================================OUTPUT=========================================

	if(output != "")
	{
	    document.getElementById("outdiv").hidden = false;
	    document.getElementById("out").innerHTML = output;
	}
	else document.getElementById("outdiv").hidden = true;
}

function resetDevice()
{
	output = "erase startup-config" + "<br>" + "reload" + "<br>";
	document.getElementById("outdiv").hidden = false;
	document.getElementById("out").innerHTML = output;
}

//========================================================================================================================


function levels(x) //transfer levels
{
	if(currentlvl == x)
	{
		return;
	}
	else if(currentlvl < x) //raise lvl
	{
		for(let i = currentlvl; i < x; i++)
		{
		    output += cmds[i];
		    currentlvl++;
		}
	}
	else if(currentlvl > x) //lower lvl
	{
	    for(let i = currentlvl; i > x; i--)// 3 > 1 exit 2 > 1 exit 1 > 1
	    {
	        output += "exit" + "<br>";
	        currentlvl--;
	    }
	}
			
}

//=====================================SOME ALERT TWEAK=========================================

var originalAlert = alert,
    alerts = 0;
alert = (...vars) => {
    if (alerts < 1) {
        alerts++;
        originalAlert(vars);
    }
}