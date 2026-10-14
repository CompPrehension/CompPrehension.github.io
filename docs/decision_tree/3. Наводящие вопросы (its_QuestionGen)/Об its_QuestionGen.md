[its_QuestionGen](https://github.com/CompPrehension/its_QuestionGen)  - компонент системы, служащий для построения структуры наводящих вопросов на основе деревьев решений, а также для реализации текстового взаимодействия с пользователем на основе этой структуры
## Функционал в этом модуле
- Построение структуры (последовательностей) наводящих вопросов на основе [графа мыслительных процессов](../1.%20Модели%20(its_DomainModel)/Дерево%20решений/Дерево%20(граф)%20решений).
- Генерация текстовых формулировок наводящих вопросов (а также ответов и объяснений для них) для данной структуры в конкретной ситуации.
	- Введение [выражений](../1.%20Модели%20(its_DomainModel)/Дерево%20решений/Выражения) в стороннюю систему текстовых шаблонов (см. [JavaStringTemplating](https://github.com/Max-Person/JavaStringTemplating)) для построения формулировок на основе данных о предметной области.
	- Динамическое построение формулировок на основе структуры [выражений](../1.%20Модели%20(its_DomainModel)/Дерево%20решений/Выражения) в конкретных узлах ГМП.

Подробнее о функционале этого модуля читайте в других статьях данного раздела - в первую очередь в [[./Категории наводящих вопросов.md|«Категории наводящих вопросов»]], где разобрано, какие вопросы порождаются для каждого вида узлов и из каких [метаданных](../1.%20Модели%20(its_DomainModel)/Дерево%20решений/Соглашения%20о%20метаданных.md#ключи-наводящих-вопросов) собираются их формулировки.
О том, как устроены сами формулировки - как подставлять в них данные о предметной области - см. [[./Шаблонизация текстов.md|«Шаблонизация текстов»]].

## Примеры использования
Примеры использования описаны на Java, т.к. я думаю, что вы с большей вероятностью будете использовать именно ее (использование на Kotlin в принципе аналогично, и более просто).

Данные примеры также полагаются на код из its_DomainModel, подробнее см. [[../1. Модели (its_DomainModel)/Об its_DomainModel.md#Примеры-использования|их примеры использования]].
#### Построение автомата наводящих вопросов
```java  
DomainSolvingModel model = ... ;
    
QuestionAutomata questionAutomata = FullBranchStrategy.INSTANCE.buildAndFinalize(  
    model.getDecisionTree().getMainBranch(),  
    new EndQuestionState()  
);
```
#### Построение диалоговой ситуации
```java
DomainModel situationModel = ... ;

String localizationCode = "RU";
QuestioningSituation questioningSituation = new QuestioningSituation(situationModel, localizationCode)
```
#### Ведение диалога в конкретной ситуации

Начиная с `3.0.0` диалог удобнее всего вести через `DialogDriver`:

```java
QuestionAutomata questionAutomata = ... ;
QuestioningSituation questioningSituation = ... ;

DialogStep step = DialogDriver.start(questionAutomata, questioningSituation);
while (true) {
    //Объяснения, накопленные до вопроса (или до конца диалога), в порядке выдачи
    handleExplanations(step.getExplanations());
    if (step.isFinished()) {
        break;
    }
    //<Как-то получаем ответы пользователя на вопрос step.getQuestion()>
    List<Integer> answers = handleQuestion(step.getQuestion());
    step = DialogDriver.answer(step.getState(), questioningSituation, answers);
}
```

`DialogDriver` сам проходит состояния без вопросов, поэтому шаг всегда заканчивается либо вопросом, либо концом диалога. Если диалог ведется по запросам (например, в веб-приложении), между шагами достаточно сохранить ситуацию и `step.getState().getId()`, а продолжить диалог - через `DialogDriver.resume(questionAutomata.get(stateId), questioningSituation)`.

Устаревший способ - ручной обход состояний автомата:

```java
QuestionState currentState = questionAutomata.getInitState();  
while (currentState != null) {  
    QuestionStateResult stateResult = currentState.getQuestion(questioningSituation);  
    //Если переход к следующему вопросу  
    if(stateResult instanceof QuestionStateChange stateChange){  
        //<Как-то обрабатываем объяснение о переходе к след. вопросу>  
        handleExplanation(stateChange.getExplanation());  
        currentState = stateChange.getNextState();  
    }  
    //Иначе если вопрос  
    else if (stateResult instanceof Question question) {  
        //<Как-то получаем ответы пользователя на вопрос>  
        List<Integer> answers = handleQuestion(question);  
        QuestionStateChange stateChange = currentState.proceedWithAnswer(questioningSituation, answers);  
        //<Как-то обрабатываем объяснение о переходе к след. вопросу>  
        handleExplanation(stateChange.getExplanation());  
        currentState = stateChange.getNextState();  
    }  
}
```
