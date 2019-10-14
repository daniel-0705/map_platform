
function ajax (method,url,data,callback){
   
  let xhr = new XMLHttpRequest();

  xhr.open(method, url);  
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('authorization', 'Bearer '+ localStorage.getItem("access_token"));

  if (data !== null){
    xhr.send(JSON.stringify(data));
  }else{
    xhr.send();
  }

  xhr.onreadystatechange=function() {
    if (this.readyState == 4 && this.status == 200) {
      let response_data = JSON.parse(xhr.response);
      if(response_data.error){
        alert(response_data.error);
      }else{
        console.log(response_data);
        callback(response_data)
      }             
    }
  }
}

function delete_child_element(parent_element){
    let parent_place = document.getElementsByClassName(parent_element)[0];
    while (parent_place.hasChildNodes()) {
      parent_place.removeChild(parent_place.lastChild);
    }
}

    
