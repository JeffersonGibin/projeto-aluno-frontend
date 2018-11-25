$(document).ready(() => {

	if(window.__API_URL__ == "" || typeof window.__API_URL__ == "undefined"){
		alert("URL da API não configurada!");
		return false;
	}

	const URL_API = window.__API_URL__;
	const SERVICE = "/aluno";


	var AlunoMedia = {

		initiation : () => {			
			AlunoMedia.TABLE.loader();
			AlunoMedia.bindEvent();
		},

		TABLE : {
			drawRow : (data) =>{

				var $tr = $([
					"<tr>",
					"<td>",
					"<span class='custom-checkbox'>",
					"<input class='checkbox' type='checkbox' name='line'>",
					"<label  for='checkbox1'></label>",
					"</span>",
					"</td>",
					"<td>"+ data.nome +"</td>",
					"<td>"+ data.dataNascimentoFormated +"</td>",
					"<td>"+ data.media +"</td>",
					"</tr>"
				].join(""));

				$tr.data(data);

				$("#table-aluno tbody").append($tr);
			},

			loader : () => {
				$("#table-aluno tbody tr").remove();

				//desenha linha da tabela
				AlunoMedia.REQUEST.fetch("GET", "listaTodosAlunos").then((response) => {
					response.dados.forEach((item) => {
						AlunoMedia.TABLE.drawRow(item);
					});
				});
			},

			bindEvent : () => {
				$(document).on("click", "#table-aluno input.checkbox", function(){
					if($(this).is(":checked")){
						$("#table-aluno input.checkbox").attr('disabled',true);
						$(this).removeAttr('disabled');
					}else{
						$("#table-aluno input.checkbox").removeAttr('disabled');
					}
				});
			}
		},

		REQUEST : {
			fetch : function ( method, rota, dados){
				$(".loader").show();
				return new Promise(function(resolve, reject) {
					$.ajax({
						url : URL_API+SERVICE+"/"+rota,
						contentType: "application/json",
						data : JSON.stringify(dados),
						dataType : 'json',
						method: method,
						success : (response) => {
							resolve(response, response.dados);
							$(".loader").hide();
						},
						error : (request, status, error) =>  {
							if(request.responseJSON.status != 200){
								alert(request.responseJSON.message);
								$(".loader").hide();
								return false;
							}
						}
					});
				});
			}
		},

		bindEvent : () => {
			// eventos da tabela
			AlunoMedia.TABLE.bindEvent();


			//botão importar que está fora  da modal
			$("#editar").on("click", function(){
				if(!$("#table-aluno input.checkbox:checked").length){
					alert("Por favor selecione um aluno para cadastrar a média");
					return false;
				}
				
				let dataRowChecked = $("#table-aluno input.checkbox:checked").parents("tr").data();

				$("#nome-editar").val(dataRowChecked.nome);
				$("#dataNascimento-editar").val(dataRowChecked.dataNascimento);
			});

			// botão que está dentro da modal Importar
			$("#btn-editar-modal").on("click", function(){
				let dataRowChecked = $("#table-aluno input.checkbox:checked").parents("tr").data();
				let rota = "editarAluno/"+dataRowChecked.id;

				if(!$("#media").val()){
					alert("Por favor infome uma média!");
					return false;
				}

				AlunoMedia.REQUEST.fetch("PUT", rota, {
					nome : dataRowChecked.nome,
					media : $("#media").val()
				})
				.then((response) => {
					alert(response.message);
					$('#modal-editar-aluno').modal('toggle');
					AlunoMedia.TABLE.loader();
					AlunoMedia.clearForm();
				});
			});

		},

		clearForm : () => {
			$("#media").val();
		}

	};

	AlunoMedia.initiation();
});