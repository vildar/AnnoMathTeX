import logging
from jquery_unparam import jquery_unparam
from django.shortcuts import render
from django.views.generic import View
from django.http import HttpResponse

from ..forms.uploadfileform import UploadFileForm
from ..forms.save_annotation_form import SaveAnnotationForm
from .helper_classes.token_clicked_handler import TokenClickedHandler
from .helper_classes.file_handler import FileHandler
from .helper_classes.cache_handler import CacheHandler
from .helper_classes.wikipedia_article_name_handler import WikipediaArticleNameHandler
from .helper_classes.session_saved_handler import SessionSavedHandler
from .helper_classes.wikidata_qid_handler import WikidataQIDHandler
from .helper_classes.data_repo_handler import DataRepoHandler


logging.basicConfig(level=logging.INFO)
annotation_view_logger = logging.getLogger(__name__)


class AnnotationView(View):
    """
    This view is where everything going on in the frontend is handled.
    """
    form_class = UploadFileForm
    initial = {'key': 'value'}
    save_annotation_form = {'form': SaveAnnotationForm()}
    template_name = 'annotation_template_tmp.html'


    def get(self, request, *args, **kwargs):
        """
        This method handles get request from the frontend.
        :param request: Request object. Request made by the user through the frontend.
        :return: The rendered response containing the template name and the necessary form.
        """
        article_name = CacheHandler().read_file_name_cache()

        annotation_view_logger.info(article_name)

        processed_file = FileHandler(request).get_processed_repo_article(article_name)
        annotation_view_logger.info('GET, filename: {}'.format(article_name))
        return render(request, self.template_name, {'File': processed_file, 'test': 3})



    def post(self, request, *args, **kwargs):
        """
        This method handles post request from the frontend. Any data being passed to the backend will be passed through
        a post request, meaning that this method will be called for all tasks that require the frontend in any way to
        access the backend.
        :param request: Request object. Request made by the user through the frontend.
        :return: The rendered response containing the template name, the necessary form and the response data (if
                 applicable).
        """
        items = {k: jquery_unparam(v) for (k, v) in request.POST.items()}
        if 'action' in items:
            action = list(items['action'].keys())[0]
        else:
            action = 'saveSession'
        annotation_view_logger.info('POST, action: {}'.format(action))
        #annotation_view_logger.info(items)
        #annotation_view_logger.info(request.POST)

        if 'file_submit' in request.POST:
            return FileHandler(request).process_local_file()

        elif action == 'getRecommendations':
            response, recommendations_dict = TokenClickedHandler(items).get_recommendations()
            return response

        elif action == 'checkManualRecommendationQID':
            print('FFFFFFFFFFF')
            response = WikidataQIDHandler(request, items).add_qids()
            print('GGGGGGGGGGGG')
            return response

        elif action == 'saveSession':
            import json
            print(request.body)
            items_request_body = json.loads(request.body)

            return SessionSavedHandler(request, items_request_body).save()

        elif action == 'getRenderedWikipediaArticle':
            return WikipediaArticleNameHandler(request, items).handle_name()

        elif action == 'getArticleText':
            import json
            # Get article name from cache
            article_name = CacheHandler().read_file_name_cache()

            # Get article in bytes format and convert to text
            article_bytes = DataRepoHandler().get_wikipedia_article(article_name)
            article_text = article_bytes.decode('utf-8')

            response = HttpResponse(json.dumps(article_text), content_type='application/json')

            return response 

        elif action == 'updateArticle':
            import json
            post_data = request.POST
            annotations, file_name, manual_recommendations = json.loads(post_data['annotations']), json.loads(post_data['fileName']), json.loads(post_data['manualRecommendations'])
            items_request_body = {
                'annotations': annotations,
                'file_name': file_name,
                'manual_recommendations': manual_recommendations 
            }
            article_name = CacheHandler().read_file_name_cache()
            article_content = request.POST['articleText']
            
            article_name = article_name.replace(' (Wikitext)', '.txt')
            article_name = article_name.replace(' (LaTeX)', '.tex')
            article_name = article_name.replace(' ', '_')
            path = 'files/{}'.format(article_name)

            return SessionSavedHandler(request, items_request_body).save_update(path, article_content)

        return render(request, "file_upload_wiki_suggestions_2.html", self.initial)
